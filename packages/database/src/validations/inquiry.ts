import { z } from "zod";

export const createInquirySchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  phone: z.string().min(1, "연락처를 입력해주세요"),
  email: z.string().email("올바른 이메일을 입력해주세요").optional().or(z.literal("")),
  content: z.string().min(1, "문의 내용을 입력해주세요"),
});

export const updateInquirySchema = z.object({
  status: z.enum(["PENDING", "REPLIED", "CLOSED"]).optional(),
  adminReply: z.string().optional(),
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;
export type UpdateInquiryInput = z.infer<typeof updateInquirySchema>;
