"use client"

import {
  ArrowLeft,
  Clock,
  BarChart3,
  Award,
  CheckCircle2,
  Users,
  Star,
  BookOpen,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { fetchCourseById, enrollInCourse, Course } from "@/lib/api/public"
import { useParams } from "next/navigation"
import CustomVideoPlayer from "@/components/Customvideoplayer"
import LandingHeader from "@/components/landingpages/header"

export default function CourseDetailPage() {
  const params = useParams()
  const courseId = params.courseId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolled, setEnrolled] = useState(false)
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    loadCourse()
  }, [courseId])

  const loadCourse = async () => {
    try {
      setLoading(true)
      const courseData = await fetchCourseById(courseId)
      setCourse(courseData)
    } catch (error) {
      console.error("Error loading course:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async () => {
    try {
      setEnrolling(true)

      const token = localStorage.getItem("token")
      if (!token) {
        alert("Please log in to enroll in courses")
        return
      }

      await enrollInCourse(courseId)
      setEnrolled(true)
      alert("Successfully enrolled in the course!")
    } catch (error) {
      console.error("Error enrolling:", error)
      alert("Failed to enroll. Please try again.")
    } finally {
      setEnrolling(false)
    }
  }

  const formatPrice = (price: number) => {
    if (price === 0) return "Free"
    return `${price.toLocaleString()} RWF`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading course...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl text-gray-600">Course not found</p>
          <Link href="/category">
            <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Browse Courses
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LandingHeader />
      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Header */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-gray-900 mb-3">
                    {course.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      November 02, 2024
                    </span>
                    <span>•</span>
                    <span>10 min read</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Player */}
            {course.video && course.video.trim() !== "" ? (
              <div className="bg-white shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Course Preview
                </h2>
                <CustomVideoPlayer
                  videoUrl={course.video}
                  posterUrl={course.videoThumbnail}
                  className="aspect-video"
                />
              </div>
            ) : (
              <div className="bg-white shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Course Preview
                </h2>
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                  {course.videoThumbnail ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={course.videoThumbnail}
                        alt="Course preview"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="text-center text-white">
                          <BookOpen className="w-16 h-16 mx-auto mb-3 opacity-80" />
                          <p className="text-lg font-semibold">
                            Video preview coming soon
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <BookOpen className="w-16 h-16 mx-auto mb-3" />
                      <p className="text-lg font-semibold">
                        Video preview coming soon
                      </p>
                      <p className="text-sm mt-2">
                        Full course content available after enrollment
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* About Course */}
            <div className="bg-white shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                About This Course
              </h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg mb-4">
                  {course.description}
                </p>
              </div>
            </div>

            {/* What You'll Learn */}
            {course.prerequisites && course.prerequisites.length > 0 && (
              <div className="bg-white shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  What You&apos;ll Learn
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {course.prerequisites.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-4 bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-gray-700 font-medium">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Enrollment Card */}
              <div className="bg-white shadow-lg p-6 border-2 border-blue-100">
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-500 mb-2">Course Price</p>
                  <p className="text-4xl font-bold text-gray-900">
                    {formatPrice(course.price || 0)}
                  </p>
                </div>

                <button
                  onClick={handleEnroll}
                  disabled={enrolled || enrolling}
                  className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                >
                  {enrolling
                    ? "Enrolling..."
                    : enrolled
                    ? "✓ Enrolled"
                    : "Enroll Now"}
                </button>
              </div>

              {/* Course Details */}
              <div className="bg-white shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Course Details
                </h3>
                <div className="space-y-4">
                  {course.duration_weeks && (
                    <div className="flex items-center justify-between py-3 border-b">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-gray-600">Duration</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {course.duration_weeks} weeks
                      </span>
                    </div>
                  )}

                  {course.difficulty_level && (
                    <div className="flex items-center justify-between py-3 border-b">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-gray-600">Level</span>
                      </div>
                      <span className="font-semibold text-gray-900 capitalize">
                        {course.difficulty_level}
                      </span>
                    </div>
                  )}

                  {course.is_certified && (
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 flex items-center justify-center">
                          <Award className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-gray-600">Certificate</span>
                      </div>
                      <span className="font-semibold text-green-600">
                        Included
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm p-6 text-white">
                <h3 className="text-lg font-bold mb-4">This course includes:</h3>
                <ul className="space-y-3">
                  {[
                    "Lifetime access",
                    "Certificate of completion",
                    "24/7 student support",
                    "Mobile and desktop access",
                    "Downloadable resources",
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}