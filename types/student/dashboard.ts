import { Course } from "@/lib/api/public";

interface DashboardCourse{
    _id: string;
    instructor_id: string;
    totalStudent: number;
    title: string;
    description: string;
    thumbnail: string;
}

interface DashboardModule {
    _id: string;
    title: string
}

export interface DashboardAuthor {
    _id: string;
    name: string;
}

export interface DashboardEnrollment { 
    _id: string;
    user_id: string;
    course_id: Course;
    totalLessons: number;
    completedLessons: number;
    payment_confirmed: boolean;
    isFullyUnlocked: boolean
    moduleAccessLimit: string;
    paymentStatus: string;
    status: string;
    progress_percentage: number;
    lastAccessed: string;
    enrolled_at: string
}

export interface DashboardAssignment {
    _id: string;
    course_id: DashboardCourse;
    module_id: DashboardModule;
    title: string;
    description: string;
    dueDate: string;
    availableAfter: string;
    points: number;
    submissionType: string;
    allowedAttempts: number;
    status: string;
    isAnomymous: boolean;
    peerReviewEnabled: boolean;
    plagiarismCheckEnabled: boolean
    instructions: string;
    attachment: string;
    rublic: string;
    created_at: string;
    updated_at: string;
}

export interface DashboardAnnouncement {
    _id: string;
    course_id: DashboardCourse;
    title: string;
    content: string;
    author: DashboardAuthor;
    type: string;
    is_pinned: string;
    is_published: string;
    published_at: string;
    expired_at: string;
    attachments: string;
}

export interface DashboardStats {
    totalCourses: number;
    averageProgress: number;
    upcomingDeadlinr: number;
    totalAssignments: number
}

export interface StudentDashboardData {
  enrollments: DashboardEnrollment[];
  assignments: DashboardAssignment[];
  announcements: DashboardAnnouncement[];
  recentActivity: unknown[];
  stats: DashboardStats;
  upcomingDeadlines: unknown[];
}

export interface DashboardResponse {
  message: string;
  data: StudentDashboardData;
}