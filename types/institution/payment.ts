export interface Notification {
  _id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  createdAt: string;
}


export type PaymentFormValues = {
user_id: string;
course_id: string;
amount_paid: number;
attachment: File | null;
};