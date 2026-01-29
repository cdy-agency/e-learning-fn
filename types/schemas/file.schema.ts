import { z } from "zod";

export const formSchema = z.object({
  title: z.string().min(2),
  resource_type: z.enum(["pdf", "doc", "video", "audio", "other"]),
  file: z.any().refine((file) => file instanceof File, {
    message: "File is required",
  }),
});