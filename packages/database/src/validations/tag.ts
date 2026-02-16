import { z } from "zod";

export const createTagSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  slug: z.string().min(1, "slug를 입력해주세요"),
  type: z.enum(["FEATURE", "DURATION", "PRICE_RANGE", "ACCOMMODATION"]).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const updateTagSchema = createTagSchema.partial();

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
