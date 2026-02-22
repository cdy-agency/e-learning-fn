"use client";

import {
  Bell,
  BookOpen,
  FileText,
  X,
  PlayCircle,
  ChevronRight,
  Clock,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  isPast,
  isWithinInterval,
  addDays,
  formatDistanceToNow,
} from "date-fns";
import {
  fetchCourseById,
  getCourseProgress,
  getCourseAssignments,
  getCourseAnnouncements,
  CourseProgress,
  CourseAssignment,
  CourseAnnouncement,
} from "@/lib/api/student/courses.api";
import { useParams } from "next/navigation";

// Helpers
function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function safeTimeAgo(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return formatDistanceToNow(d, { addSuffix: true });
}

function getDueStatus(dueDate: string): {
  label: string;
  color: string;
  border: string;
} {
  const due = new Date(dueDate);
  const now = new Date();
  if (isPast(due))
    return {
      label: "Overdue",
      color: "text-red-600",
      border: "border-l-red-400",
    };
  if (isWithinInterval(due, { start: now, end: addDays(now, 3) }))
    return {
      label: "Due soon",
      color: "text-orange-500",
      border: "border-l-orange-400",
    };
  return {
    label: "Upcoming",
    color: "text-cyan-600",
    border: "border-l-cyan-400",
  };
}

function filterActiveAnnouncements(items: CourseAnnouncement[]) {
  return items.filter((item) => {
    if (!item.expires_at) return true;
    const expiry = new Date(item.expires_at);
    return isNaN(expiry.getTime()) || !isPast(expiry);
  });
}

function filterActiveAssignments(items: CourseAssignment[]) {
  return items.filter((item) => {
    if (!item.dueDate) return true;
    const due = new Date(item.dueDate);
    return isNaN(due.getTime()) || !isPast(due);
  });
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-gray-100 animate-pulse rounded ${className}`} />;
}

export default function CourseHomePage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const [courseTitle, setCourseTitle] = useState("");
  const [instructorName, setInstructorName] = useState("");
  const [progress, setProgress] = useState<CourseProgress>({
    progress_percentage: 0,
    completedLessons: 0,
    totalLessons: 0,
  });
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);
  const [announcements, setAnnouncements] = useState<CourseAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const [courseRes, progressRes, assignmentsRes, announcementsRes] =
        await Promise.allSettled([
          fetchCourseById(courseId),
          getCourseProgress(courseId),
          getCourseAssignments(courseId),
          getCourseAnnouncements(courseId),
        ]);
      if (cancelled) return;

      if (courseRes.status === "fulfilled") {
        const c = courseRes.value as any;
        setCourseTitle(c?.title ?? "");
        setInstructorName(
          c?.instructor_id?.user_id?.name ||
            c?.instructor_id?.profession_name ||
            "",
        );
      }
      if (progressRes.status === "fulfilled") setProgress(progressRes.value);
      if (assignmentsRes.status === "fulfilled")
        setAssignments(filterActiveAssignments(assignmentsRes.value));
      if (announcementsRes.status === "fulfilled")
        setAnnouncements(filterActiveAnnouncements(announcementsRes.value));
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  // Next upcoming assignment for the highlight card
  const nextAssignment = assignments[0] ?? null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* ── Content ── */}
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {/* Page title row */}
        <div className="mb-6">
          {loading ? (
            <Skeleton className="w-64 h-7 mb-1" />
          ) : (
            <h2 className="text-2xl font-bold text-gray-900">{courseTitle}</h2>
          )}
          {instructorName && !loading && (
            <p className="text-sm text-gray-400 mt-0.5">
              Instructor: {instructorName}
            </p>
          )}
        </div>

        {/* ── Progress banner ── */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex items-center gap-6">
          {loading ? (
            <div className="flex-1 space-y-2">
              <Skeleton className="w-40 h-3" />
              <Skeleton className="w-full h-2" />
            </div>
          ) : (
            <>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-gray-500">
                    Course Progress
                  </span>
                  <span className="text-xs font-bold text-cyan-600">
                    {progress.progress_percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="h-1.5 bg-cyan-500 rounded-full transition-all duration-700"
                    style={{ width: `${progress.progress_percentage}%` }}
                  />
                </div>
                {progress.totalLessons > 0 && (
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    {progress.completedLessons} of {progress.totalLessons}{" "}
                    lessons completed
                  </p>
                )}
              </div>

              <Link
                href={`/student/courses/${courseId}/learn`}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                Continue Learning
              </Link>
            </>
          )}
        </div>

        {/* ── Two column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT — Deadlines */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">
                Deadlines of Assignements this week
                {!loading && assignments.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    {assignments.length} open
                  </span>
                )}
              </h3>
              {!loading && assignments.length > 2 && (
                <button className="text-xs text-cyan-600 hover:underline">
                  See all
                </button>
              )}
            </div>

            {loading ? (
              [1, 2, 3].map((i) => <Skeleton key={i} className="w-full h-16" />)
            ) : assignments.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col items-center gap-2 text-gray-400">
                <CheckCircle2 className="w-8 h-8 opacity-30" />
                <p className="text-sm">
                  No upcoming deadlines — you&apos;re all caught up!
                </p>
              </div>
            ) : (
              assignments.map((assignment) => {
                const status = getDueStatus(assignment.dueDate);
                return (
                  <div
                    key={assignment._id}
                    className={`bg-white border border-gray-200 border-l-4 ${status.border} rounded-xl p-4 flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors cursor-pointer`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FileText className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-800 truncate">
                          {assignment.title}
                        </h4>
                        {assignment.module_id?.title && (
                          <p className="text-xs text-gray-400 truncate">
                            {assignment.module_id.title}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span
                            className={`text-xs font-medium ${status.color}`}
                          >
                            Due: {formatDate(assignment.dueDate)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {assignment.points} pts
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
                  </div>
                );
              })
            )}

            {/* Announcements */}
            <div className="pt-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  Announcements
                </h3>
                {!loading && announcements.length > 0 && (
                  <span className="text-[11px] text-gray-400">
                    {announcements.length} total
                  </span>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="w-full h-10" />
                    ))}
                  </div>
                ) : announcements.length === 0 ? (
                  <div className="p-6 flex flex-col items-center gap-2 text-gray-400">
                    <Bell className="w-6 h-6 opacity-30" />
                    <p className="text-xs">No announcements yet</p>
                  </div>
                ) : (
                  announcements.slice(0, 5).map((a) => (
                    <div
                      key={a._id}
                      className="flex items-start gap-3 p-3.5 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="w-7 h-7 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bell className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-gray-800 truncate">
                            {a.title}
                          </p>
                          {a.is_pinned && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full uppercase flex-shrink-0">
                              Pinned
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">
                          {stripHtml(a.content)}
                        </p>
                        <p className="text-[10px] text-gray-300 mt-0.5">
                          {safeTimeAgo(a.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT — Announcements + Next assignment card */}
          <div className="space-y-4">
            {!loading &&
              nextAssignment &&
              (() => {
                const status = getDueStatus(nextAssignment.dueDate);
                return (
                  <div className="bg-gray-900 rounded-xl p-5 text-white">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Next deadline
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <h3 className="font-bold text-base mb-1 line-clamp-2">
                      {nextAssignment.title}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-4">
                      {stripHtml(nextAssignment.description)}
                    </p>
                    <div className="space-y-1.5 mb-5">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Due {formatDate(nextAssignment.dueDate)}</span>
                      </div>
                      {nextAssignment.module_id?.title && (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{nextAssignment.module_id.title}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <FileText className="w-3.5 h-3.5" />
                        <span>
                          {nextAssignment.points} points ·{" "}
                          {nextAssignment.submissionType}
                        </span>
                      </div>
                    </div>
                    <button className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-semibold rounded-lg transition-colors">
                      View Assignment
                    </button>
                  </div>
                );
              })()}
          </div>
        </div>
      </div>
    </div>
  );
}
