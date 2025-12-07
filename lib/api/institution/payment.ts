// lib/api/admin/payments.ts
import { API_URL } from "@/lib/axios";
import axios from "axios";

export interface Payment {
  _id: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
  };
  course_id: {
    _id: string;
    title: string;
    price: number;
  };
  amount_paid: number;
  attachment: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface PaymentsResponse {
  page: number;
  limit: number;
  total: number;
  payments: Payment[];
}

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export async function getPayments(
  page: number = 1,
  limit: number = 10,
  search: string = ""
): Promise<PaymentsResponse> {
  try {
    const { data } = await axios.get(`${API_URL}/api/payment`, {
      params: { page, limit, search },
      headers: getAuthHeaders(),
    });
    return data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch payments"
    );
  }
}

export async function reviewPayment(
  paymentId: string,
  action: "approve" | "reject"
): Promise<any> {
  try {
    const { data } = await axios.post(
      `${API_URL}/api/payment/${paymentId}/review`,
      { action },
      { headers: getAuthHeaders() }
    );
    return data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to review payment"
    );
  }
}

export async function deletePayment(paymentId: string): Promise<any> {
  try {
    const { data } = await axios.delete(
      `${API_URL}/api/payment/${paymentId}`,
      { headers: getAuthHeaders() }
    );
    return data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to delete payment"
    );
  }
}