import { z } from "zod";

export const createBookingSchema = z.object({
  tourProductId: z.string().min(1, "상품을 선택해주세요"),
  name: z.string().min(1, "이름을 입력해주세요"),
  phone: z.string().min(1, "연락처를 입력해주세요"),
  email: z.string().email("올바른 이메일을 입력해주세요").optional().or(z.literal("")),
  peopleCount: z.number().int().min(1, "인원을 1명 이상 입력해주세요"),
  desiredDate: z.string().optional(),
  selectedOptions: z
    .array(
      z.object({
        optionId: z.string(),
        name: z.string(),
        price: z.number(),
        quantity: z.number().int().min(1),
      })
    )
    .optional(),
  totalPrice: z.number().int().optional(),
  requests: z.string().optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
