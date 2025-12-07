import { z } from "zod";

// Schema matching the actual form fields
export const paymentSchema = z.object({
  course_id: z.string().min(1, "Please select a course"),
  amountPaid: z.number().min(1, "Amount must be greater than zero"),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;