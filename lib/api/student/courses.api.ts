import axiosInstance from "@/lib/axios";
import { Course } from "@/lib/api/public";

export interface CourseProgress {
  progress_percentage: number;
  completedLessons: number;
  totalLessons: number;
}

export interface CourseGrade {
  _id: string;
  title: string;
  grade: number;
  feedback?: string;
  gradedAt?: string;
}

export interface CourseAssignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  points: number;
  submissionType: string;
  status: string;
  module_id?: { _id: string; title: string };
}

export interface CourseAnnouncement {
  _id: string;
  title: string;
  content: string;
  type: string;
  author?: { _id: string; name: string };
  is_pinned: boolean;
  publish_at?: string;
  expires_at?: string;
  created_at: string;
}

export interface EnrolledCourse {
  _id: string;
  course_id: Course;
  progress_percentage: number;
  completedLessons: number;
  totalLessons: number;
  status: string;
  enrolled_at: string;
  price: number;
  lastAccessed?: string;
}

//  Enrolled courses 
export async function getStudentEnrolledCourses(): Promise<EnrolledCourse[]> {
  const { data } = await axiosInstance.get("/api/enrollment");
  if (Array.isArray(data))           return data;
  if (Array.isArray(data?.courses))  return data.courses;
  return [];
}

// Single course
export async function fetchCourseById(courseId: string): Promise<Course> {
  const { data } = await axiosInstance.get<Course>(`/api/courses/${courseId}`);
  return data;
}

// Progress
export async function getCourseProgress(courseId: string): Promise<CourseProgress> {
  const { data } = await axiosInstance.get<CourseProgress>(
    `/api/student/courses/${courseId}/progress`
  );
  return data;
}

// Grades
export async function getStudentGrades(courseId: string): Promise<CourseGrade[]> {
  const { data } = await axiosInstance.get(`/api/student/courses/${courseId}/grades`);
  if (Array.isArray(data))          return data;
  if (Array.isArray(data?.grades))  return data.grades;
  return [];
}

// Assignments

export async function getCourseAssignments(courseId: string): Promise<CourseAssignment[]> {
  const { data } = await axiosInstance.get(`/api/assignments/course/${courseId}`);
  if (Array.isArray(data))               return data;
  if (Array.isArray(data?.assignments))  return data.assignments;
  return [];
}

// Announcements

export async function getCourseAnnouncements(courseId: string): Promise<CourseAnnouncement[]> {
  const { data } = await axiosInstance.get(`/api/announcements/course/${courseId}`);
  if (Array.isArray(data))                return data;
  if (Array.isArray(data?.announcements)) return data.announcements;
  return [];
}

// Mark lesson complete
export async function markLessonComplete(
  lessonId: string,
  payload?: Record<string, any>
): Promise<any> {
  const formData = new FormData();
  formData.append("completed", "true");

  if (payload) {
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
  }

  const { data } = await axiosInstance.post(
    `/api/student/lessons/${lessonId}/complete`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export async function getEnrollmentByCourseId(courseId: string): Promise<EnrolledCourse | null> {
  try {
    const { data } = await axiosInstance.get(`/api/enrollment/${courseId}`);
    return data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null; 
    }
    throw error;
  }
}

