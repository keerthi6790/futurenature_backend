import { buildJsonSchemas } from "fastify-zod";
import z from "zod";

const AddCategoryRequestSchema = z.object({
  name: z.string().optional(),
  categoryName: z.string().optional(),
  categoryId: z.string().optional(),
  image_url: z.string().optional(),
  categoryImage: z.string().optional(),
  imageUrl: z.string().optional(),
});

const UpdateCategoryRequestSchema = AddCategoryRequestSchema.partial();

const AssignProductsRequestSchema = z.object({
  productIds: z.array(z.string()),
  categoryId: z.string().optional(),
});

export type ZodAddCategoryRequestSchema = z.infer<typeof AddCategoryRequestSchema>;
export type ZodUpdateCategoryRequestSchema = z.infer<typeof UpdateCategoryRequestSchema>;
export type ZodAssignProductsRequestSchema = z.infer<typeof AssignProductsRequestSchema>;

export const { schemas: categorySchemas, $ref } = buildJsonSchemas(
  {
    AddCategoryRequestSchema,
    UpdateCategoryRequestSchema,
    AssignProductsRequestSchema,
  },
  { $id: "categorySchemas" }
);

