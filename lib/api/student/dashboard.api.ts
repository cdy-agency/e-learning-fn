import axiosInstance from "@/lib/axios";
import { AccountOverview, StudentAlert } from "@/types/student/student.types";
import { DashboardResponse } from "@/types/student/dashboard";

export interface DashboardParams {
  enrollments_page?: number;
  enrollments_limit?: number;
  enrollments_search?: string;
  assignments_page?: number;
  assignments_limit?: number;
  assignments_search?: string;
  assignments_status?: string;
  announcements_page?: number;
  announcements_limit?: number;
  announcements_search?: string;
  activity_page?: number;
  activity_limit?: number;
  activity_search?: string;
  activity_action?: string;
}

export async function getStudentDashboard(
  params?: any,
): Promise<any> {
  const { data } = await axiosInstance.get<DashboardResponse>(
    "/api/student/dashboard",
    { params },
  );
  return data;
}

//  Notifications
export async function getStudentNotifications() {
  const { data } = await axiosInstance.get("/api/notifications");
  return data;
}

//  Calendar
export async function getStudentCalendar() {
  const { data } = await axiosInstance.get("/api/student/calendar");
  if (Array.isArray(data)) return data;
  const assignments = Array.isArray(data?.assignments) ? data.assignments : [];
  const announcements = Array.isArray(data?.announcements)
    ? data.announcements
    : [];
  if (assignments.length || announcements.length)
    return [...assignments, ...announcements];
  return [];
}

//  Account overview
export async function getAccountOverview(): Promise<{
  message: string;
  overview: AccountOverview;
}> {
  const { data } = await axiosInstance.get("/api/student/account/overview");
  return data;
}

//  Alerts
export async function getStudentAlerts(): Promise<{
  message: string;
  alerts: StudentAlert[];
  count: number;
}> {
  const { data } = await axiosInstance.get("/api/student/alerts");
  return data;
}
