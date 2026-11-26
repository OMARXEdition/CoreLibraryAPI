import { z } from 'zod';

const text = z.string().trim().min(1);

export const createBookSchema = z.strictObject({
  title: text,
  author: text,
  genre: text,
  available: z.boolean()
});

export const updateBookSchema = createBookSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: 'At least one field is required' }
);

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
