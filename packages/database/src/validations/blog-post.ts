import { z } from "zod";

export const createBlogPostSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  content: z.string().min(1, "내용을 입력해주세요"),
  excerpt: z.string().optional(),
  thumbnail: z.string().url("올바른 URL을 입력해주세요").optional().or(z.literal("")),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
});

export const updateBlogPostSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요").optional(),
  content: z.string().min(1, "내용을 입력해주세요").optional(),
  excerpt: z.string().optional(),
  thumbnail: z.string().url("올바른 URL을 입력해주세요").optional().or(z.literal("")),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  publishedAt: z.date().optional(),
});

export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>;
