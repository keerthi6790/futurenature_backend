import { buildJsonSchemas } from "fastify-zod";
import z from "zod";

export const AddReviewSchema = z.object({
  message: z.string({
    required_error: "Message is required",
  }),
  rating: z
    .number({
      required_error: "Rating is Required",
    })
    .min(1, { message: "Minimum 1" })
    .max(5, { message: "Maximum is 5" }),
});

export type ZodAddReviewSchema = z.infer<typeof AddReviewSchema>;

export const { schemas: reviewSchema, $ref } = buildJsonSchemas(
  { AddReviewSchema },
  { $id: "reviewSchema" }
);
