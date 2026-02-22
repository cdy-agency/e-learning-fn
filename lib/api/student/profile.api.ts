import axiosInstance from "../../axios";
import { API_URL } from '../config';
import { StudentProfile } from '@/types/student/student.types';

export async function getMyStudentProfile(): Promise<{ message: string; student: StudentProfile }> {
  const res = await axiosInstance.get(`${API_URL}/api/student/profile`);
  return res.data;
}

export async function updateMyStudentProfile(form: FormData): Promise<{ message: string; student: StudentProfile }> {
  const res = await axiosInstance.put(`${API_URL}/api/student/profile`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function updateStudentPassword(payload: { oldPassword: string; newPassword: string }): Promise<{ message: string }> {
  const res = await axiosInstance.put(`${API_URL}/api/student/password`, payload);
  return res.data;
}

