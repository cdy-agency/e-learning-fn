"use client"

import { useState, useEffect } from "react"
import { X, BookOpen, Calendar, Users, Search, Plus } from "lucide-react"
import Link from "next/link"
import { fetchEnrolledCourses } from "@/lib/api/courses"
import { useAuth } from "@/lib/hooks/use-auth"

interface Course {
  _id: string
  title: string
  description: string
  price: number
  difficulty_level: string
  duration_weeks: number
  thumbnail?: string
  instructor_id?: string
}

interface Enrollment {
  _id: string
  course_id: Course
  user_id: string
  enrolled_at: string
  status: string
}

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const { user, isAuthenticated } = useAuth()
  
  useEffect(() => {
    if (isAuthenticated && user) {
      loadEnrolledCourses()
    }
  }, [isAuthenticated, user])

  const loadEnrolledCourses = async () => {
    try {
      setLoading(true)
      const enrolledCourses = await fetchEnrolledCourses()
      setEnrollments(enrolledCourses)
    } catch (error) {
      console.error("Failed to load enrolled courses:", error)
    } finally {
      setLoading(false)
    }
  }
  
  // Extract courses from enrollments for filtering
  const courses = enrollments.map(enrollment => enrollment.course_id)
  
  const filteredCourses = courses.filter(course =>
    course?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course?.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Show loading state while checking authentication
  if (!isAuthenticated || !user) {
    return (
      <div className="flex flex-1 flex-col bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto w-full p-6">
          <div className="text-center">
            <p>Please log in to view your courses.</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto w-full p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col bg-gray-50 min-h-screen">
      <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-white px-4 sm:px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BookOpen className="h-5 w-5 text-blue-600" />
          </div>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">My Courses</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors duration-200">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <div className="max-w-6xl mx-auto w-full p-4 sm:p-6">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Your Learning Journey</h2>
              <p className="text-gray-600 mb-4">
                Access all your enrolled courses and continue your learning progress.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link 
                  href="/student/courses/catalog" 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Browse All Courses
                </Link>
                <Link 
                  href="/student/courses/catalog" 
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Course Catalog
                </Link>
              </div>
            </div>
          </div>

          {/* Search and Course List */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 px-1 sm:px-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Enrolled Courses ({filteredCourses.length})
              </h3>
              
              {/* Search Bar */}
              <div className="relative w-full sm:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.map((course) => (
                <Link key={course._id} href={`/student/courses/${course._id}/home`} className="block group">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5 hover:shadow-md hover:border-blue-200 transition-all duration-200 h-full">
                    <div className="flex flex-col h-full">
                      <h4 className="text-base sm:text-lg font-semibold text-blue-600 group-hover:text-blue-700 mb-2 line-clamp-2">
                        {course.title}
                      </h4>
                      
                      <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{course.difficulty_level}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{course.duration_weeks} weeks</span>
                        </div>
                      </div>
                      
                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-gray-500">Click to access course content</span>
                        <div className="flex items-center text-blue-600 text-xs sm:text-sm font-medium group-hover:text-blue-700">
                          Continue Learning
                          <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Empty State (if no courses) */}
          {courses.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses yet</h3>
              <p className="text-gray-600 mb-4">Start your learning journey by exploring available courses.</p>
              <Link 
                href="/student/courses/catalog" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Browse Courses
              </Link>
            </div>
          )}

          {/* Footer Info */}
          <div className="mt-8 bg-blue-50 rounded-lg border border-blue-200 p-4">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-blue-100 rounded-lg mt-0.5">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">Customize Your Course List</p>
                <p className="text-sm text-blue-700">
                  Visit the Course Catalog to discover new courses and expand your learning journey.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}