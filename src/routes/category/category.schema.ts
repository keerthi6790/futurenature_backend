import { buildJsonSchemas } from "fastify-zod";
import z from "zod";

const AddCategoryRequestSchema = z.object({
  categoryName: z.string({
    required_error: "Category Name is required",
  }),
  categoryId: z.string().optional(),
  categoryImage: z.string().optional(),
});

const UpdateCategoryRequestSchema = AddCategoryRequestSchema.partial();

export type ZodAddCategoryRequestSchema = z.infer<typeof AddCategoryRequestSchema>;
export type ZodUpdateCategoryRequestSchema = z.infer<typeof UpdateCategoryRequestSchema>;

export const { schemas: categorySchemas, $ref } = buildJsonSchemas(
  {
    AddCategoryRequestSchema,
    UpdateCategoryRequestSchema,
  },
  { $id: "categorySchemas" }
);
