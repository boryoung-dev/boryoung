import { z } from "zod";

export const createProductSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  subtitle: z.string().optional(),
  slug: z.string().min(1, "slug를 입력해주세요"),
  excerpt: z.string().optional(),
  categoryId: z.string().min(1, "카테고리를 선택해주세요"),
  destination: z.string().min(1, "목적지를 입력해주세요"),
  departure: z.string().optional(),
  airline: z.string().optional(),
  nights: z.number().int().min(0).optional(),
  days: z.number().int().min(0).optional(),
  durationText: z.string().optional(),
  golfCourses: z.any().optional(),
  totalHoles: z.number().int().optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL"]).optional(),
  minPeople: z.number().int().optional(),
  maxPeople: z.number().int().optional(),
  basePrice: z.number().int().optional(),
  originalPrice: z.number().int().optional(),
  content: z.string().optional(),
  contentHtml: z.string().optional(),
  inclusions: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
  scheduleDates: z.any().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  naverUrl: z.string().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  publishedAt: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
