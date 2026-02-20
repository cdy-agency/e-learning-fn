import axiosInstance from "@/lib/axios";
import { getAuthHeaders } from "../config";

export async function submitPaymentAPI(formData: FormData) {
  try {
    const res = await axiosInstance.post("/api/payment/submit", formData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (err: any) {
    const message =
      err.response?.data?.message ||
      err.message ||
      "Failed to submit payment";

    const error: any = new Error(message);
    error.status = err.response?.status;
    error.payload = err.response?.data;

    throw error;
  }
}

