"use client"

import { ArrowLeft, ArrowRight, Check, Menu, X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { use, useEffect, useState } from "react"
import { fetchModulesByCourseId } from "@/lib/api/courses"
import { cn } from "@/lib/utils"

// Progress tracking utilities
const getProgressKey = (courseId: string) => `course_progress_${courseId}`
const getCompletedLessons = (courseId: string): string[] => {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(getProgressKey(courseId))
  return stored ? JSON.parse(stored) : []
}

const markLessonComplete = (courseId: string, lessonId: string) => {
  const completed = getCompletedLessons(courseId)
  if (!completed.includes(lessonId)) {
    completed.push(lessonId)
    localStorage.setItem(getProgressKey(courseId), JSON.stringify(completed))
  }
}

const isLessonComplete = (courseId: string, lessonId: string): boolean => {
  return getCompletedLessons(courseId).includes(lessonId)
}

export default function CoursePageContent({
  params,
}: {
  params: Promise<{ courseId: string; pageId: string }>
}) {
  const { courseId, pageId } = use(params);
  const [page, setPage] = useState<any | null>(null)
  const [allModules, setAllModules] = useState<any[]>([])
  const [allLessons, setAllLessons] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isComplete, setIsComplete] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const modules = await fetchModulesByCourseId(courseId)
        setAllModules(modules || [])
        
        // Flatten all lessons
        const lessons = (modules || []).flatMap((m: any, mIndex: number) => 
          (m.items || m.lessons || []).map((item: any, iIndex: number) => ({
            ...item,
            moduleTitle: m.title,
            moduleIndex: mIndex,
            itemIndex: iIndex,
            id: item._id || item.url
          }))
        )
        setAllLessons(lessons)
        
        // Find current page
        const found = lessons.find((it: any) => {
          const id = String(it._id || '')
          const url = String(it.url || '')
          return id === pageId || url === pageId
        })
        
        setPage(found || null)
        
        // Find current index
        const idx = lessons.findIndex((it: any) => {
          const id = String(it._id || '')
          const url = String(it.url || '')
          return id === pageId || url === pageId
        })
        setCurrentIndex(idx)
        
        // Check if completed
        if (found) {
          const lessonId = found._id || found.url
          setIsComplete(isLessonComplete(courseId, lessonId))
        }
        
        // Calculate progress
        const completed = getCompletedLessons(courseId)
        const progressPercent = lessons.length > 0 
          ? Math.round((completed.length / lessons.length) * 100) 
          : 0
        setProgress(progressPercent)
        
      } catch {
        setPage(null)
        setAllLessons([])
      }
    }
    load()
  }, [courseId, pageId])

  const handleMarkComplete = () => {
    if (page) {
      const lessonId = page._id || page.url
      markLessonComplete(courseId, lessonId)
      setIsComplete(true)
      
      // Recalculate progress
      const completed = getCompletedLessons(courseId)
      const progressPercent = allLessons.length > 0 
        ? Math.round((completed.length / allLessons.length) * 100) 
        : 0
      setProgress(progressPercent)
      
      // Automatically go to next lesson after 1 second
      setTimeout(() => {
        if (currentIndex < allLessons.length - 1) {
          const nextLesson = allLessons[currentIndex + 1]
          window.location.href = `/student/courses/${courseId}/pages/${nextLesson.url || nextLesson._id}`
        }
      }, 1000)
    }
  }

  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  if (!page) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
          <p className="text-gray-600 mb-4">The lesson you&apos;re looking for doesn&apos;t exist.</p>
          <Link 
            href={`/student/courses/${courseId}/modules`}
            className="text-blue-600 hover:underline"
          >
            ← Back to Modules
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar - Course Modules */}
      <aside className={cn(
        "fixed lg:static inset-y-0 right-0 z-40 w-80 bg-white border-l border-gray-200 overflow-y-auto transition-transform duration-300",
        isSidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Course Content</h3>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>{progress}% Complete</span>
              <span>{getCompletedLessons(courseId).length} / {allLessons.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Modules List */}
        <div className="p-4 space-y-2">
          {allModules.map((module, mIndex) => {
            const moduleItems = allLessons.filter(l => l.moduleIndex === mIndex)
            const completedInModule = moduleItems.filter(item => 
              isLessonComplete(courseId, item._id || item.url)
            ).length
            const moduleProgress = moduleItems.length > 0 
              ? Math.round((completedInModule / moduleItems.length) * 100)
              : 0

            return (
              <div key={mIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
                      {module.title}
                    </h4>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {moduleProgress}%
                    </span>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {moduleItems.map((item, iIndex) => {
                    const isActive = item.id === pageId || 
                                    String(item._id) === pageId || 
                                    String(item.url) === pageId
                    const isItemComplete = isLessonComplete(courseId, item._id || item.url)

                    return (
                      <Link
                        key={iIndex}
                        href={`/student/courses/${courseId}/pages/${item.url || item._id}`}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors",
                          isActive && "bg-blue-50 border-l-4 border-blue-600"
                        )}
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <div className={cn(
                          "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2",
                          isItemComplete 
                            ? "bg-green-500 border-green-500" 
                            : isActive
                            ? "bg-blue-100 border-blue-600"
                            : "bg-white border-gray-300"
                        )}>
                          {isItemComplete && (
                            <Check className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <span className={cn(
                          "text-sm flex-1 line-clamp-2",
                          isActive ? "font-medium text-blue-900" : "text-gray-700",
                          isItemComplete && "text-gray-500"
                        )}>
                          {item.title}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 md:p-8 lg:p-12">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link 
              href={`/student/courses/${courseId}/modules`}
              className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Course
            </Link>
          </div>

          {/* Lesson Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                {page.title}
              </h1>
              {!isComplete && (
                <Button
                  onClick={handleMarkComplete}
                  className="flex-shrink-0 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              )}
              {isComplete && (
                <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">Completed</span>
                </div>
              )}
            </div>
            
            {page.moduleTitle && (
              <p className="text-sm text-gray-600">
                Part of: <span className="font-medium">{page.moduleTitle}</span>
              </p>
            )}
          </div>

          {/* Lesson Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12 mb-8">
            <div
              className="prose prose-lg max-w-none
                prose-headings:text-gray-900 prose-headings:font-bold
                prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-8
                prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-6
                prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-4
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:my-4
                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-gray-900 prose-strong:font-semibold
                prose-ul:my-4 prose-ol:my-4
                prose-li:text-gray-700 prose-li:my-2
                prose-img:rounded-lg prose-img:shadow-md prose-img:my-8
                prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic
                prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded"
              dangerouslySetInnerHTML={{
                __html: page.content || "<p>No content available.</p>",
              }}
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4 py-6 border-t border-gray-200">
            {previousLesson ? (
              <Link
                href={`/student/courses/${courseId}/pages/${previousLesson.url || previousLesson._id}`}
                className="group flex items-center gap-3 px-6 py-3 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <ArrowLeft className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                <div className="text-left">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Previous</p>
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">
                    {previousLesson.title}
                  </p>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <Link
                href={`/student/courses/${courseId}/pages/${nextLesson.url || nextLesson._id}`}
                className="group flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg ml-auto"
              >
                <div className="text-right">
                  <p className="text-xs text-blue-100 uppercase tracking-wide">Next Lesson</p>
                  <p className="text-sm font-medium line-clamp-1">
                    {nextLesson.title}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <div className="ml-auto flex items-center gap-2 px-6 py-3 bg-green-50 text-green-700 rounded-lg border-2 border-green-200">
                <Check className="h-5 w-5" />
                <span className="font-medium">Course Complete!</span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}