"use client";

import { useMemo } from "react";
import { useStudentDashboard } from "@/lib/hooks/student";
import { DashboardEnrollment, DashboardAssignment, DashboardAnnouncement } from "@/types/student/dashboard";

// Components
import StatsOverview    from "@/components/student/dashboard/Statsoverview";
import CourseProgress   from "@/components/student/dashboard/Courseprogress";
import RecommendedCourses from "@/components/student/dashboard/Recommendedcourses";
import Announcements from "@/components/student/dashboard/Announcements";
import Assignments from "@/components/student/dashboard/Assignments";
import LoadingState     from "@/components/student/dashboard/Loadingstate";
import ErrorState       from "@/components/student/dashboard/Errorstate";

function DashboardOverview() {
  const { data: response, isLoading, error } = useStudentDashboard();

  const dashboardData = response?.data;

  const enrollments = useMemo<DashboardEnrollment[]>(
    () => dashboardData?.enrollments ?? [],
    [dashboardData]
  );

  const assignments = useMemo<DashboardAssignment[]>(
    () => dashboardData?.assignments ?? [],
    [dashboardData]
  );

  const announcements = useMemo<DashboardAnnouncement[]>(
    () => dashboardData?.announcements ?? [],
    [dashboardData]
  );
const stats = useMemo(() => dashboardData?.stats ?? null, [dashboardData]);

  // Guards 
  if (isLoading) return <LoadingState />;
  if (error)     return <ErrorState error={error} />;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-[1400px] mx-auto p-4">

        {/* Main 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-8 space-y-6">
            <StatsOverview
              enrollments={enrollments as any}
              stats={stats}
            />

            {/* Enrolled courses table */}
            <CourseProgress enrollments={enrollments as any} />
            <RecommendedCourses />
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Announcements announcements={announcements} />
            <Assignments assignments={assignments} />
          </div>

        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;