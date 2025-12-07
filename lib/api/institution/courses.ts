import axiosInstance from "../../axios";
import { API_URL } from "../../axios";

export async function getInstitutionById(id: string) {
  const res = await axiosInstance.get(`${API_URL}/api/institutions/${id}`);
  return res.data;
}

export async function getCoursesByInstitution(id: string) {
  const res = await axiosInstance.get(`${API_URL}/api/institutions/${id}/courses`);
  return res.data;
}


export async function confirmPayment(enrollmentId: string) {
  try {
    const res = await axiosInstance.patch(`${API_URL}/api/payment/${enrollmentId}`);
    return res.data;
  } catch (error: any) {
    console.error('Confirm payment error:', error);
    throw error.response?.data || error;
  }
}

