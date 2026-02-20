"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Clock,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";
import Image from "next/image";
import { useStudentDashboard } from "@/lib/hooks/student";
import { DashboardEnrollment } from "@/types/student/dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Course } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export default function CoursesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredCourse, setHoveredCourse] = useState<Course | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { data: response, isLoading, error } = useStudentDashboard();

  const dashboardData = response?.data;

  const enrollments = useMemo<DashboardEnrollment[]>(
    () => dashboardData?.enrollments ?? [],
    [dashboardData],
  );

  // Extract courses from enrollments for filtering
  const courses = enrollments.map((enrollment) => enrollment.course_id);

  const filteredCourses = courses.filter(
    (course) =>
      course?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course?.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getDifficultyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "text-green-700";
      case "intermediate":
        return "text-yellow-700";
      case "advanced":
        return "text-red-700";
      default:
        return "text-gray-700";
    }
  };

  const getModuleCount = (course: Course) => {
    return 2;
  };

  const handleCourseClick = (courseId: string | undefined) => {
    if (courseId) {
      router.push(`/student/courses/${courseId}`);
    }
  };

  // Show isLoading state while checking authentication
  if (!isAuthenticated || !user) {
    return (
      <div className="flex flex-1 flex-col bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto w-full p-6">
          <div className="text-center">
            <p>Please log in to view your courses.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto w-full p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid lg:grid-cols-4 gap-5">
          {/* Main Content - Courses */}
          <div className="lg:col-span-3">
            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                // isLoading skeletons
                Array.from({ length: 6 }).map((_, index) => (
                  <Card
                    key={index}
                    className="overflow-hidden border-0 shadow-sm"
                  >
                    <div className="h-48 bg-gray-200 animate-pulse" />
                    <CardContent className="p-5 space-y-3">
                      <div className="h-4 bg-gray-200 animate-pulse w-3/4" />
                      <div className="h-3 bg-gray-200 animate-pulse w-full" />
                      <div className="h-3 bg-gray-200 animate-pulse w-2/3" />
                    </CardContent>
                  </Card>
                ))
              ) : filteredCourses.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500">
                  No courses found
                </div>
              ) : (
                filteredCourses.map((course) => (
                  <div
                    key={course._id}
                    className="relative group"
                    onMouseEnter={() => setHoveredCourse(course)}
                    onMouseLeave={() => setHoveredCourse(null)}
                  >
                    {/* Main Card */}
                    <Link href={`/course/${course._id}`}>
                      <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow h-full">
                        {/* Image */}
                        <div className="relative h-48 bg-gray-100">
                          {course.thumbnail ? (
                            <Image
                              src={course.thumbnail}
                              alt={course.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500" />
                          )}
                        </div>

                        <CardContent className="p-5">
                          {/* Badges */}
                          <div className="flex items-center gap-2 mb-3">
                            <Badge
                              variant="outline"
                              className="text-xs font-medium uppercase rounded-none border-none bg-transparent hover:bg-transparent truncate"
                            >
                              {course.category?.name || "General"}
                            </Badge>

                            <Badge
                              className={`text-xs font-medium uppercase bg-white hover:bg-transparent ${getDifficultyColor(course.difficulty_level)}`}
                            >
                              {course.difficulty_level}
                            </Badge>
                          </div>

                          {/* Title */}
                          <h3 className="font-semibold text-gray-900 text-base mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors truncate">
                            {course.title}
                          </h3>

                          {/* Meta Info */}
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                            {/* Duration */}
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                {course.duration_weeks
                                  ? `${course.duration_weeks} weeks`
                                  : "—"}
                              </span>
                            </div>

                            {/* Price */}
                            <span className="text-sm font-bold text-gray-900">
                              {course.price === 0 ? (
                                "Free"
                              ) : (
                                <span>
                                  {course?.price?.toLocaleString()} RWF
                                </span>
                              )}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>

                    {/* Hover Popup */}
                    {hoveredCourse?._id === course._id && (
                      <div className="absolute inset-0 bg-white z-50 scale-105 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 ease-out shadow-xl">
                        <div className="p-4">
                          {/* Category Badge */}
                          <div className="mb-4">
                            <Badge
                              variant="outline"
                              className="text-sm font-medium uppercase rounded-none border-none"
                            >
                              {course.category?.name || "General"}
                            </Badge>
                          </div>

                          {/* Title */}
                          <h2 className="text-base font-bold text-gray-900 mb-4 line-clamp-2">
                            {course.title}
                          </h2>

                          {/* Description */}
                          <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                            {course.description}
                          </p>

                          {/* Course Details Grid */}
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <BookOpen className="h-4 w-4" />
                              <span>{getModuleCount(course)} Modules</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Clock className="h-4 w-4" />
                              <span>
                                {course.duration_weeks
                                  ? `${course.duration_weeks} weeks`
                                  : "4 hours"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-[12px] text-gray-700">
                              <Star className="h-3 w-3" />
                              <span className="uppercase">
                                {course.difficulty_level}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-[12px] text-gray-700">
                              <Clock className="h-3 w-3" />
                              <span>
                                {course.price === 0
                                  ? "Free"
                                  : `${course?.price?.toLocaleString()} RWF`}
                              </span>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="flex items-center justify-center gap-5">
                            <Link
                              href={`/course/${course._id}`}
                              className="flex-1"
                            >
                              <button className="w-full border border-gray-200 text-foreground p-1 rounded">
                                Preview
                              </button>
                            </Link>

                            <button
                              onClick={() => handleCourseClick(course?._id)}
                              className="flex-1"
                            >
                              <p className="w-full bg-primary hover:bg-cyan-600 text-white p-1 rounded">
                                Open
                              </p>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
