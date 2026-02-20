"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/auth-context";
import { getPayments } from "@/lib/api/institution/payment";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showToast } from "@/lib/api/courses";
import { submitPaymentAPI } from "@/lib/api/student/payment.api";
import { getStudentEnrolledCourses } from "@/lib/api/student";
import {
  paymentSchema,
  type PaymentFormValues,
} from "@/types/institution/payment.schema";

export default function PaymentPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCoursePrice, setSelectedCoursePrice] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    mode: "onChange",
  });

  const selectedCourseId = watch("course_id");

  // Fetch enrolled courses using your existing API
  const { data: enrolledCourses, isLoading: loadingCourses } = useQuery({
    queryKey: ["enrolledCourses"],
    queryFn: getStudentEnrolledCourses,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["institution-payments"],
    queryFn: () => getPayments(),
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (selectedCourseId && enrolledCourses) {
      const enrollment = enrolledCourses.find(
        (e: any) =>
          e?.course_id?._id === selectedCourseId ||
          e?.course_id === selectedCourseId
      );
      if (enrollment) {
        const price = enrollment.course_id?.price || enrollment.price || 0;
        setSelectedCoursePrice(price);
        setValue("amountPaid", price);
      }
    }
  }, [selectedCourseId, enrolledCourses, setValue]);

  const mutation = useMutation<any, Error, FormData>({
    mutationFn: submitPaymentAPI,
     retry: false,
    onMutate: () => {
      setIsSubmitting(true);
    },
    onSuccess: () => {
      showToast("Your payment was sent successfully!", "success");
      reset();
      setSelectedFile(null);
      setSelectedCoursePrice(0);
      setIsSubmitting(false);
    },
    onError: (err: any) => {
      showToast(err?.message,'error' );
      setIsSubmitting(false);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: PaymentFormValues) => {
    if (isSubmitting) return;

    if (!selectedFile) {
      showToast("Please attach payment proof", "error");
      return;
    }

    const formData = new FormData();
    formData.append("course_id", data.course_id);
    formData.append("amount_paid", String(data.amountPaid));
    formData.append("attachment", selectedFile);

    mutation.mutate(formData);
  };
  const onError = (errors: any) => {
    console.log("Form validation errors:", errors);
    showToast("Please fill in all required fields correctly", "error");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  if (loadingCourses) {
    return (
      <div className="max-w-lg mx-auto py-8 text-center">
        <p>Loading your enrolled courses...</p>
      </div>
    );
  }

  if (!enrolledCourses || enrolledCourses.length === 0) {
    return (
      <div className="max-w-lg mx-auto py-8 text-center">
        <p className="text-gray-600">
          You haven{"'"}t enrolled in any courses yet.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Submit Payment</h1>

      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
        <div>
          <Label htmlFor="courseId">Select Course *</Label>
          <Select
            onValueChange={(value) => {
              console.log("Course selected:", value);
              setValue("course_id", value, { shouldValidate: true });
            }}
            value={selectedCourseId}
          >
            <SelectTrigger id="courseId">
              <SelectValue placeholder="Choose a course" />
            </SelectTrigger>
            <SelectContent>
              {enrolledCourses.map((enrollment: any) => {
                const courseId =
                  enrollment.course_id?._id || enrollment.course_id;
                const courseTitle =
                  enrollment.course_id?.title || enrollment.title || "Course";
                const coursePrice =
                  enrollment.course_id?.price || enrollment.price || 0;

                return (
                  <SelectItem key={courseId} value={courseId}>
                    {courseTitle} - ${coursePrice}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {errors.course_id && (
            <p className="text-red-500 text-sm mt-1">
              {errors.course_id.message}
            </p>
          )}
        </div>

        {selectedCoursePrice > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Course Price:</strong> ${selectedCoursePrice}
            </p>
          </div>
        )}

        <div>
          <Label htmlFor="amountPaid">Amount Paid</Label>
          <Input
            id="amountPaid"
            type="number"
            step="0.01"
            {...register("amountPaid", { valueAsNumber: true })}
            placeholder="Enter amount paid"
          />
          {errors.amountPaid && (
            <p className="text-red-500 text-sm mt-1">
              {errors.amountPaid.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="attachment">Payment Proof *</Label>
          <Input
            id="attachment"
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          {selectedFile && (
            <p className="text-sm text-green-600 mt-1">✓ {selectedFile.name}</p>
          )}
          {!selectedFile && (
            <p className="text-xs text-gray-500 mt-1">
              Required: Upload a screenshot or receipt of your payment
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={mutation.isPending || isSubmitting}
          className="w-full"
        >
          {mutation.isPending || isSubmitting
            ? "Submitting..."
            : "Submit Payment"}
        </Button>
      </form>
    </div>
  );
}
