"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPayments,
  reviewPayment,
  deletePayment,
  type Payment,
} from "@/lib/api/institution/payment";
import { toast } from "react-toastify";
import { PaymentReviewModal } from "@/components/institution/paymentReviewModal";

type ModalState = {
  isOpen: boolean;
  action: "approve" | "reject" | "delete";
  paymentId: string | null;
  paymentDetails: {
    studentName: string;
    courseName: string;
    amount: number;
  } | null;
};

export default function InstitutionPaymentsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    action: "approve",
    paymentId: null,
    paymentDetails: null,
  });

  const queryClient = useQueryClient();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch payments
  const { data, isLoading } = useQuery({
    queryKey: ["institution-payments", page, debouncedSearch],
    queryFn: () => getPayments(page, 10, debouncedSearch),
    refetchInterval: 10000,
  });

  // Review payment mutation
  const reviewMutation = useMutation({
    mutationFn: ({
      paymentId,
      action,
    }: {
      paymentId: string;
      action: "approve" | "reject";
    }) => reviewPayment(paymentId, action),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["institution-payments"] });
      toast.success(
        variables.action === "approve"
          ? "✅ Payment approved! Student has full access."
          : "❌ Payment rejected."
      );
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to review payment");
      closeModal();
    },
  });

  // Delete payment mutation
  const deleteMutation = useMutation({
    mutationFn: deletePayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institution-payments"] });
      toast.success("🗑️ Payment deleted successfully");
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete payment");
      closeModal();
    },
  });

  const openModal = (
    action: "approve" | "reject" | "delete",
    payment: Payment
  ) => {
    setModalState({
      isOpen: true,
      action,
      paymentId: payment._id,
      paymentDetails: {
        studentName: payment.user_id?.name || "Unknown",
        courseName: payment.course_id?.title || "Unknown Course",
        amount: payment.amount_paid,
      },
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      action: "approve",
      paymentId: null,
      paymentDetails: null,
    });
  };

  const handleConfirmAction = () => {
    if (!modalState.paymentId) return;

    if (modalState.action === "delete") {
      deleteMutation.mutate(modalState.paymentId);
    } else {
      reviewMutation.mutate({
        paymentId: modalState.paymentId,
        action: modalState.action,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-blue-600 text-lg font-medium animate-pulse">
          Loading payments...
        </div>
      </div>
    );
  }

  const payments = data?.payments || [];
  const filteredPayments =
    filterStatus === "all"
      ? payments
      : payments.filter((p: Payment) => p.status === filterStatus);

  const totalPages = Math.ceil((data?.total || 0) / 10);

  const pendingCount = payments.filter(
    (p: Payment) => p.status === "pending"
  ).length;

  return (
    <>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Management
          </h1>
          <p className="text-gray-600">
            Review and manage student payment submissions for your courses
          </p>
          {pendingCount > 0 && (
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              {pendingCount} pending payment{pendingCount !== 1 ? "s" : ""}{" "}
              awaiting review
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by student name, email, or course..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchInput !== debouncedSearch && (
              <p className="text-xs text-gray-500 mt-1">Searching...</p>
            )}
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Payments Table */}
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          {filteredPayments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg">No payments found</p>
              <p className="text-sm mt-2">
                {filterStatus !== "all"
                  ? `No ${filterStatus} payments`
                  : "Payment submissions will appear here"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Attachment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPayments.map((payment: Payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.user_id?.name || "Unknown"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.user_id?.email || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {payment.course_id?.title || "Unknown Course"}
                        </div>
                        <div className="text-sm text-gray-500">
                          Price: ${payment.course_id?.price || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          ${payment.amount_paid}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            payment.status
                          )}`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {payment.attachment && (
                          <a
                            href={payment.attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View Proof
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal("approve", payment)}
                            disabled={payment.status === "approved"}
                            className={`px-3 py-1 text-xs font-medium rounded ${
                              payment.status === "approved"
                                ? "bg-green-600 text-white cursor-not-allowed"
                                : "bg-green-600 text-white hover:bg-green-700"
                            }`}
                          >
                            {payment.status === "approved"
                              ? "✓ Approved"
                              : "Approve"}
                          </button>

                          <button
                            onClick={() => openModal("reject", payment)}
                            disabled={payment.status === "rejected"}
                            className={`px-3 py-1 text-xs font-medium rounded ${
                              payment.status === "rejected"
                                ? "bg-red-600 text-white cursor-not-allowed"
                                : "bg-red-600 text-white hover:bg-red-700"
                            }`}
                          >
                            {payment.status === "rejected"
                              ? "✓ Rejected"
                              : "Reject"}
                          </button>

                          <button
                            onClick={() => openModal("delete", payment)}
                            className="px-3 py-1 bg-gray-600 text-white text-xs font-medium rounded hover:bg-gray-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <PaymentReviewModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={handleConfirmAction}
        action={modalState.action}
        paymentDetails={modalState.paymentDetails}
        isLoading={reviewMutation.isPending || deleteMutation.isPending}
      />
    </>
  );
}
