import { z } from "zod";

export const createCurationSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  description: z.string().optional(),
  imageUrl: z.string().url("올바른 URL을 입력해주세요").optional().or(z.literal("")),
  linkUrl: z.string().url("올바른 URL을 입력해주세요").optional().or(z.literal("")),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const updateCurationSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요").optional(),
  description: z.string().optional(),
  imageUrl: z.string().url("올바른 URL을 입력해주세요").optional().or(z.literal("")),
  linkUrl: z.string().url("올바른 URL을 입력해주세요").optional().or(z.literal("")),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export type CreateCurationInput = z.infer<typeof createCurationSchema>;
export type UpdateCurationInput = z.infer<typeof updateCurationSchema>;
