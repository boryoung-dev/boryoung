import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  slug: z.string().min(1, "slug를 입력해주세요"),
  description: z.string().optional(),
  icon: z.string().optional(),
  emoji: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  level: z.number().int().min(0).max(2).optional(),
  parentId: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
