import React from "react";

interface PaymentReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: "approve" | "reject" | "delete";
  paymentDetails?: {
    studentName: string;
    courseName: string;
    amount: number;
  } | null;
  isLoading?: boolean;
}

export const PaymentReviewModal: React.FC<PaymentReviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  paymentDetails,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const getActionConfig = () => {
    switch (action) {
      case "approve":
        return {
          title: "Approve Payment",
          message: "Are you sure you want to approve this payment? The student will get full access to the course.",
          buttonText: "Approve Payment",
          buttonClass: "bg-green-600 hover:bg-green-700",
        };
      case "reject":
        return {
          title: "Reject Payment",
          message: "Are you sure you want to reject this payment? The student will need to resubmit.",
          buttonText: "Reject Payment",
          buttonClass: "bg-red-600 hover:bg-red-700",
        };
      case "delete":
        return {
          title: "Delete Payment",
          message: "Are you sure you want to delete this payment record? This action cannot be undone.",
          buttonText: "Delete Payment",
          buttonClass: "bg-gray-600 hover:bg-gray-700",
        };
    }
  };

  const config = getActionConfig();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{config.title}</h2>

        {paymentDetails && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">Student:</span>
                <span className="ml-2 text-gray-900">{paymentDetails.studentName}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Course:</span>
                <span className="ml-2 text-gray-900">{paymentDetails.courseName}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Amount:</span>
                <span className="ml-2 text-gray-900 font-semibold">
                  ${paymentDetails.amount}
                </span>
              </div>
            </div>
          </div>
        )}

        <p className="text-gray-600 mb-6">{config.message}</p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${config.buttonClass}`}
          >
            {isLoading ? "Processing..." : config.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};