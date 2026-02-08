import { Course, Module, Lesson } from "@/lib/types/course";
import { User } from "@/lib/types/auth";
import { CourseProgress } from "@/lib/types/progress";
import { IAssignment } from "@/types/assignment";
import { CourseAnalytics, DashboardAnalyticsSummary } from "@/types/analytics";
import { Notification } from "@/types/notification";

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  submittedAtISO: string;
  gradePercent?: number;
  feedback?: string;
  status: "submitted" | "graded" | "missing";
}

export interface RubricCriterion {
  id: string;
  title: string;
  description: string;
  points: number;
}

export interface OfficeHourSlot {
  id: string;
  instructorId: string;
  courseId?: string;
  startISO: string;
  endISO: string;
  location: string;
  notes?: string;
}

export interface AnnouncementInput {
  courseId: string;
  title: string;
  message: string;
}

export interface Announcement extends AnnouncementInput {
  id: string;
  createdAtISO: string;
}

// In-memory stores (mock DB)
export const users: User[] = [
  {
    _id: "u1", email: "alice@example.com", name: "Alice Instructor", institution: { name: "Demo U", id: "i1" }, role: "instructor",
    image: ""
  },
  {
    _id: "s1", email: "stud1@example.com", name: "Student One", institution: { name: "Demo U", id: "i1" }, role: "student",
    image: ""
  },
  {
    _id: "s2", email: "stud2@example.com", name: "Student Two", institution: { name: "Demo U", id: "i1" }, role: "student",
    image: ""
  },
];

export const courses: Course[] = [
  {
    _id: "c1", instructor_id: "u1", title: "Writing 101", description: "Basics", price: 0, thumbnail: "", difficulty_level: "beginner", students: 2, prerequisites: [], start_date: new Date(), end_date: new Date(), is_certified: false, duration_weeks: 6,
    videoThumbnail: "",
    externalUrl: "",
    video: ""
  },
  {
    _id: "c2", instructor_id: "u1", title: "Advanced Writing", description: "Advanced", price: 0, thumbnail: "", difficulty_level: "advanced", students: 0, prerequisites: [], start_date: new Date(), end_date: new Date(), is_certified: true, duration_weeks: 8,
    videoThumbnail: "",
    externalUrl: "",
    video: ""
  },
];

export const enrollments: CourseProgress[] = [
  { user_id: "s1", course_id: "c1", totalLesson: 10, completedLessons: 6, lastAccessed: new Date(), enrolled_at: new Date(), status: "active", progress_percentage: 60 },
  { user_id: "s2", course_id: "c1", totalLesson: 10, completedLessons: 4, lastAccessed: new Date(), enrolled_at: new Date(), status: "active", progress_percentage: 40 },
];

export const assignments: IAssignment[] = [
  { id: "a1", title: "Essay Draft", dueDate: new Date().toISOString(), availableAfter: new Date().toISOString(), status: "open", points: 100, submissionType: "file", attempts: 0, allowedAttempts: 1, introduction: "Draft an essay.", instructions: [] },
];

export const submissions: Submission[] = [
  { id: "sub1", assignmentId: "a1", studentId: "s1", submittedAtISO: new Date().toISOString(), status: "submitted" },
  { id: "sub2", assignmentId: "a1", studentId: "s2", submittedAtISO: new Date().toISOString(), status: "submitted" },
];

export const rubrics: Record<string, RubricCriterion[]> = {
  a1: [
    { id: "rc1", title: "Thesis", description: "Clear thesis statement", points: 30 },
    { id: "rc2", title: "Structure", description: "Logical flow", points: 40 },
    { id: "rc3", title: "Grammar", description: "Mechanics", points: 30 },
  ],
};

export const announcements: Announcement[] = [];
export const officeHours: OfficeHourSlot[] = [];
export const notifications: Notification[] = [];
export const modules: Module[] = [];
export const lessons: Lesson[] = [];
export const courseMeta: Record<string, any> = {};
export const assignmentAttachments: Record<string, Array<{ id: string; name: string; size: number; type: string }>> = {};

export function getCourseStudentsWithProgress(courseId: string) {
  const studentEnrollments = enrollments.filter(e => e.course_id === courseId);
  return studentEnrollments.map(e => {
    const student = users.find(u => u._id === e.user_id);
    return { studentId: e.user_id, studentName: student?.name ?? "Unknown", progress: e };
  });
}

export function computeCourseAnalytics(courseId: string): CourseAnalytics {
  const course = courses.find(c => c._id === courseId);
  const courseEnrollments = enrollments.filter(e => e.course_id === courseId);
  const enrolmentCount = courseEnrollments.length;
  const completionRatePercent = enrolmentCount
    ? Math.round((courseEnrollments.filter(e => e.progress_percentage >= 100).length / enrolmentCount) * 100)
    : 0;
  const relatedSubmissions = submissions.filter(s => assignments.find(a => a.id === s.assignmentId));
  const graded = relatedSubmissions.filter(s => s.status === "graded" && typeof s.gradePercent === "number");
  const averageGradePercent = graded.length ? Math.round(graded.reduce((acc, s) => acc + (s.gradePercent || 0), 0) / graded.length) : 0;
  const submissionsPending = relatedSubmissions.filter(s => s.status === "submitted").length;
  const weeklyActiveUsers = [
    { weekStartISO: new Date().toISOString(), activeCount: Math.max(1, enrolmentCount - 1) },
  ];
  return { courseId, enrolmentCount, completionRatePercent, averageGradePercent, submissionsPending, weeklyActiveUsers };
}

export function computeDashboardSummary(instructorId: string): DashboardAnalyticsSummary {
  const instructorCourses = courses.filter(c => c.instructor_id === instructorId);
  const totalCourses = instructorCourses.length;
  const courseIds = new Set(instructorCourses.map(c => c._id));
  const courseEnrollments = enrollments.filter(e => courseIds.has(e.course_id));
  const totalStudents = new Set(courseEnrollments.map(e => e.user_id)).size;
  const avgCourseCompletionPercent = totalCourses
    ? Math.round(
        instructorCourses
          .map(c => computeCourseAnalytics(c._id).completionRatePercent)
          .reduce((a, b) => a + b, 0) / totalCourses
      )
    : 0;
  const avgCourseGradePercent = totalCourses
    ? Math.round(
        instructorCourses
          .map(c => computeCourseAnalytics(c._id).averageGradePercent)
          .reduce((a, b) => a + b, 0) / totalCourses
      )
    : 0;
  const totalPendingSubmissions = instructorCourses
    .map(c => computeCourseAnalytics(c._id).submissionsPending)
    .reduce((a, b) => a + b, 0);
  return { instructorId, totalCourses, totalStudents, avgCourseCompletionPercent, avgCourseGradePercent, totalPendingSubmissions };
}

export function pushNotification(n: Notification) {
  notifications.unshift(n)
}

