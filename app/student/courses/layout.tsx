// @ts-nocheck
"use client";

import type React from "react";
import { usePathname } from "next/navigation";
import { coursesList, courseNavigationItems } from "@/lib/data";
import Link from "next/link";
import {
  X,
  Home,
  Megaphone,
  ClipboardList,
  MessageSquare,
  GraduationCap,
  Users,
  FileText,
  File,
  Book,
  Calendar,
  Folder,
  Link as LinkIcon,
  MessageCircle,
  Clock,
  HelpCircle,
  Briefcase,
  Menu,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect, useMemo, useState } from "react";
import { fetchCourseById } from "@/lib/api/courses";
import Image from "next/image";

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const courseId = pathname.split("/")[3];
  const [courseTitle, setCourseTitle] = useState<string>("");
  const [courseTerm, setCourseTerm] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        if (!courseId) return;
        const course = await fetchCourseById(courseId);
        const title = course?.title || "Course";
        setCourseTitle(title);
        // Derive term if present elsewhere; fallback using mock data mapping by name
        const match = coursesList.find((c) =>
          title.toLowerCase().includes(String(c.name).toLowerCase()),
        );
        setCourseTerm(match?.term || "");
      } catch {}
    };
    load();
  }, [courseId]);

  const isCourseListPage = pathname === "/student/courses";
  const isSpecificCoursePage =
    courseId && pathname.startsWith(`/student/courses/${courseId}`);

  const SidebarNav = (
    <nav className="space-y-1">
      <Link
        href={`/student/courses/${courseId}/home`}
        className={cn(
          "flex items-center gap-2 xl:gap-3 px-2 xl:px-3 py-2 xl:py-2.5 text-sm xl:text-base text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200 touch-manipulation",
          pathname.includes(`/student/courses/${courseId}/home`) &&
            "bg-blue-50 text-blue-700 border-l-2 xl:border-l-4 border-blue-500 font-medium",
        )}
      >
        <Home className="h-4 w-4 xl:h-5 xl:w-5 flex-shrink-0" />
        <span className="truncate">Home</span>
      </Link>

      <Link
        href={`/student/courses/${courseId}/announcements`}
        className={cn(
          "flex items-center gap-2 xl:gap-3 px-2 xl:px-3 py-2 xl:py-2.5 text-sm xl:text-base text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200 touch-manipulation",
          pathname.includes(`/student/courses/${courseId}/announcements`) &&
            "bg-blue-50 text-blue-700 border-l-2 xl:border-l-4 border-blue-500 font-medium",
        )}
      >
        <Megaphone className="h-4 w-4 xl:h-5 xl:w-5 flex-shrink-0" />
        <span className="truncate">Announcements</span>
      </Link>

      <Link
        href={`/student/courses/${courseId}/modules`}
        className={cn(
          "flex items-center gap-2 xl:gap-3 px-2 xl:px-3 py-2 xl:py-2.5 text-sm xl:text-base text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200 touch-manipulation",
          pathname.includes(`/student/courses/${courseId}/modules`) &&
            "bg-blue-50 text-blue-700 border-l-2 xl:border-l-4 border-blue-500 font-medium",
        )}
      >
        <Folder className="h-4 w-4 xl:h-5 xl:w-5 flex-shrink-0" />
        <span className="truncate">Modules</span>
      </Link>

      <Link
        href={`/student/courses/${courseId}/pages`}
        className={cn(
          "flex items-center gap-2 xl:gap-3 px-2 xl:px-3 py-2 xl:py-2.5 text-sm xl:text-base text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200 touch-manipulation",
          pathname.includes(`/student/courses/${courseId}/pages`) &&
            "bg-blue-50 text-blue-700 border-l-2 xl:border-l-4 border-blue-500 font-medium",
        )}
      >
        <FileText className="h-4 w-4 xl:h-5 xl:w-5 flex-shrink-0" />
        <span className="truncate">Pages</span>
      </Link>

      <Link
        href={`/student/courses/${courseId}/assignments`}
        className={cn(
          "flex items-center gap-2 xl:gap-3 px-2 xl:px-3 py-2 xl:py-2.5 text-sm xl:text-base text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200 touch-manipulation",
          pathname.includes(`/student/courses/${courseId}/assignments`) &&
            "bg-blue-50 text-blue-700 border-l-2 xl:border-l-4 border-blue-500 font-medium",
        )}
      >
        <ClipboardList className="h-4 w-4 xl:h-5 xl:w-5 flex-shrink-0" />
        <span className="truncate">Assignments</span>
      </Link>

      <Link
        href={`/student/courses/${courseId}/quizzes`}
        className={cn(
          "flex items-center gap-2 xl:gap-3 px-2 xl:px-3 py-2 xl:py-2.5 text-sm xl:text-base text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200 touch-manipulation",
          pathname.includes(`/student/courses/${courseId}/quizzes`) &&
            "bg-blue-50 text-blue-700 border-l-2 xl:border-l-4 border-blue-500 font-medium",
        )}
      >
        <ClipboardList className="h-4 w-4 xl:h-5 xl:w-5 flex-shrink-0" />
        <span className="truncate">Quizzes</span>
      </Link>

      <Link
        href={`/student/courses/${courseId}/exams`}
        className={cn(
          "flex items-center gap-2 xl:gap-3 px-2 xl:px-3 py-2 xl:py-2.5 text-sm xl:text-base text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200 touch-manipulation",
          pathname.includes(`/student/courses/${courseId}/exams`) &&
            "bg-blue-50 text-blue-700 border-l-2 xl:border-l-4 border-blue-500 font-medium",
        )}
      >
        <ClipboardList className="h-4 w-4 xl:h-5 xl:w-5 flex-shrink-0" />
        <span className="truncate">Exams</span>
      </Link>

      <Link
        href={`/student/courses/${courseId}/grades`}
        className={cn(
          "flex items-center gap-2 xl:gap-3 px-2 xl:px-3 py-2 xl:py-2.5 text-sm xl:text-base text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200 touch-manipulation",
          pathname.includes(`/student/courses/${courseId}/grades`) &&
            "bg-blue-50 text-blue-700 border-l-2 xl:border-l-4 border-blue-500 font-medium",
        )}
      >
        <GraduationCap className="h-4 w-4 xl:h-5 xl:w-5 flex-shrink-0" />
        <span className="truncate">Grades</span>
      </Link>

      <Link
        href={`/student/courses/${courseId}/files`}
        className={cn(
          "flex items-center gap-2 xl:gap-3 px-2 xl:px-3 py-2 xl:py-2.5 text-sm xl:text-base text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200 touch-manipulation",
          pathname.includes(`/student/courses/${courseId}/files`) &&
            "bg-blue-50 text-blue-700 border-l-2 xl:border-l-4 border-blue-500 font-medium",
        )}
      >
        <File className="h-4 w-4 xl:h-5 xl:w-5 flex-shrink-0" />
        <span className="truncate">Files</span>
      </Link>

      <Link
        href={`/student/courses/${courseId}/syllabus`}
        className={cn(
          "flex items-center gap-2 xl:gap-3 px-2 xl:px-3 py-2 xl:py-2.5 text-sm xl:text-base text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200 touch-manipulation",
          pathname.includes(`/student/courses/${courseId}/syllabus`) &&
            "bg-blue-50 text-blue-700 border-l-2 xl:border-l-4 border-blue-500 font-medium",
        )}
      >
        <Book className="h-4 w-4 xl:h-5 xl:w-5 flex-shrink-0" />
        <span className="truncate">Syllabus</span>
      </Link>

      <Link
        href={`/student/courses/${courseId}/collaborations`}
        className={cn(
          "flex items-center gap-2 xl:gap-3 px-2 xl:px-3 py-2 xl:py-2.5 text-sm xl:text-base text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200 touch-manipulation",
          pathname.includes(`/student/courses/${courseId}/collaborations`) &&
            "bg-blue-50 text-blue-700 border-l-2 xl:border-l-4 border-blue-500 font-medium",
        )}
      >
        <Users className="h-4 w-4 xl:h-5 xl:w-5 flex-shrink-0" />
        <span className="truncate">Group Works</span>
      </Link>

      <Link
        href={`/student/courses/${courseId}/help`}
        className={cn(
          "flex items-center gap-2 xl:gap-3 px-2 xl:px-3 py-2 xl:py-2.5 text-sm xl:text-base text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200 touch-manipulation",
          pathname.includes(`/student/courses/${courseId}/help`) &&
            "bg-blue-50 text-blue-700 border-l-2 xl:border-l-4 border-blue-500 font-medium",
        )}
      >
        <HelpCircle className="h-4 w-4 xl:h-5 xl:w-5 flex-shrink-0" />
        <span className="truncate">Help</span>
      </Link>
    </nav>
  );

  return (
    <div className="flex flex-1 min-h-screen">
      {/* Course-Specific Sidebar - Only show when a specific course is selected */}
      {isSpecificCoursePage && (
        <>
          {/* Desktop Course Sidebar */}
          <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0 border-r border-gray-200 bg-white">
            <div className="flex h-14 xl:h-16 items-center justify-between border-b border-gray-200 px-3 xl:px-4">
              <h2
                className="text-sm xl:text-base font-semibold text-gray-900 truncate"
                title={courseTitle}
              >
                {courseTitle || "Course"}
              </h2>
              <button className="text-gray-600 hover:text-gray-900 p-1 rounded-md hover:bg-gray-100 transition-colors">
                <X className="h-4 w-4 xl:h-5 xl:w-5" />
                <span className="sr-only">Close sidebar</span>
              </button>
            </div>

            <div className="p-3 xl:p-4">
              {courseTerm && (
                <p className="text-xs xl:text-sm font-bold text-gray-600 mb-3 xl:mb-4">
                  {courseTerm}
                </p>
              )}

              {SidebarNav}
            </div>
          </aside>

          {/* Mobile Course Menu Button - Better positioned */}
          <div className="lg:hidden fixed top-14 left-2 z-50">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 bg-white/95 backdrop-blur border-gray-300 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Menu className="h-3 w-3" />
                  <span className="ml-1 text-xs font-medium">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80 max-w-[85vw]">
                <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4">
                  <h2
                    className="text-sm font-semibold text-gray-900 truncate"
                    title={courseTitle}
                  >
                    {courseTitle || "Course"}
                  </h2>
                </div>
                <div className="p-4">
                  {courseTerm && (
                    <p className="text-sm font-bold text-gray-600 mb-4">
                      {courseTerm}
                    </p>
                  )}
                  {SidebarNav}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </>
      )}

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col bg-white">
        {/* Add padding for mobile course menu button */}
        <div
          className={cn("flex-1", isSpecificCoursePage ? "lg:pl-0 pl-12" : "")}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
