import { z } from "zod";

export const createQuickIconSchema = z.object({
  label: z.string().min(1, "라벨을 입력해주세요"),
  iconName: z.string().min(1, "아이콘 이름을 입력해주세요"),
  linkUrl: z.string().url("올바른 URL을 입력해주세요"),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const updateQuickIconSchema = z.object({
  label: z.string().min(1, "라벨을 입력해주세요").optional(),
  iconName: z.string().min(1, "아이콘 이름을 입력해주세요").optional(),
  linkUrl: z.string().url("올바른 URL을 입력해주세요").optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export type CreateQuickIconInput = z.infer<typeof createQuickIconSchema>;
export type UpdateQuickIconInput = z.infer<typeof updateQuickIconSchema>;
