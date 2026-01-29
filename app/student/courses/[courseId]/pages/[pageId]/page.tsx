"use client"

import { ArrowLeft, ArrowRight, BookMarked, Share2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { use, useEffect, useState } from "react"
import { fetchModulesByCourseId } from "@/lib/api/courses"
import { formatContent } from "@/lib/formContent"

export default function CoursePageContent({
  params,
}: {
  params: Promise<{ courseId: string; pageId: string }>
}) {
  const { courseId, pageId } = use(params);
  const [page, setPage] = useState<any | null>(null)
  
  console.log("CoursePageContent Params:", courseId)
  console.log("PageContent Params:", pageId)

  useEffect(() => {
    const load = async () => {
      try {
        const modules = await fetchModulesByCourseId(courseId)
        const allItems = (modules || []).flatMap((m: any) => (m.items || m.lessons || []))
        const found = allItems.find((it: any) => {
          const id = (it._id ? String(it._id) : undefined)
          const url = (it.url ? String(it.url) : undefined)
          return id === pageId || url === pageId
        })
        setPage(found || null)
      } catch {
        setPage(null)
      }
    }
    load()
  }, [courseId, pageId])

  if (!page) {
    return (
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-white px-4 md:px-6">
          <h1 className="text-xl font-semibold text-gray-900">
            <Link href={`/student/courses/${courseId}/home`} className="text-blue-600 hover:underline">
              Communicating_for_Impact
            </Link>{" "}
            <span className="text-gray-400">{">"}</span>{" "}
            <Link href={`/student/courses/${courseId}/pages`} className="text-blue-600 hover:underline">
              Pages
            </Link>{" "}
            <span className="text-gray-400">{">"}</span> Page Not Found
          </h1>
        </header>
        <div className="flex flex-1 items-center justify-center p-6 text-center text-gray-500">
          <div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Page Not Found</h2>
            <p className="text-gray-600 mb-4">The page you{"'"}re looking for doesn{"'"}t exist.</p>
            <Link 
              href={`/student/courses/${courseId}/modules`}
              className="text-blue-600 hover:underline"
            >
              ← Back to Modules
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-white px-4 md:px-6">
        <h1 className="text-xl font-semibold text-gray-900">
          <Link href={`/student/courses/${courseId}/home`} className="text-blue-600 hover:underline">
            Communicating_for_Impact
          </Link>{" "}
          <span className="text-gray-400">›</span>{" "}
          <Link href={`/student/courses/${courseId}/modules`} className="text-blue-600 hover:underline">
            Modules
          </Link>{" "}
          <span className="text-gray-400">›</span> {page.title}
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" className="h-8 text-sm bg-transparent border-gray-300">
            <BookMarked className="mr-2 h-4 w-4" />
            Immersive Reader
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <Link href={`/student/courses/${courseId}/modules`} className="text-sm text-blue-600 hover:underline">
            ← Back to Modules
          </Link>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:bg-gray-100">
            <Share2 className="h-5 w-5" />
            <span className="sr-only">Share</span>
          </Button>
        </div>

        <div className="rounded-md border border-gray-200 bg-white p-8 shadow-sm flex-1">
          <h2 className="mb-6 text-3xl font-bold text-gray-800">{page.title}</h2>
          
          {/* Page Content */}
          <div
            className="
              prose prose-sm max-w-none text-gray-700 leading-relaxed

              /* Paragraph spacing */
              prose-p:my-4

              /* Heading spacing + smaller sizes */
              prose-h1:text-3xl prose-h1:mt-10 prose-h1:mb-4
              prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-3
              prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-2

              /* Optional styling improvements */
              prose-strong:text-gray-900
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline

              /* Images spacing */
              prose-img:my-6 prose-img:rounded-lg
            "
            dangerouslySetInnerHTML={{
              __html: page.content || "",
            }}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          {page.previousPage ? (
            <Button
              asChild
              variant="outline"
              className="h-9 px-4 py-2 text-sm font-medium text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-800 bg-transparent"
            >
              <Link href={`/student/courses/${courseId}/pages/${page.previousPage.url}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous: {page.previousPage.title}
              </Link>
            </Button>
          ) : (
            <div />
          )}
          {page.nextPage ? (
            <Button
              asChild
              variant="outline"
              className="h-9 px-4 py-2 text-sm font-medium text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-800 bg-transparent"
            >
              <Link href={`/student/courses/${courseId}/pages/${page.nextPage.url}`}>
                Next: {page.nextPage.title}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <div />
          )}
        </div>
      </main>
    </div>
  )
}
