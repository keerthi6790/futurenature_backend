import { buildJsonSchemas } from "fastify-zod";
import z from "zod";

const AddBannerRequestSchema = z.object({
  title: z.string().optional(),
  desktopImageUrl: z.string().optional(),
  mobileImageUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  desktopHref: z.string().optional(),
  mobileHref: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  order: z.number().optional().default(0),
});

const UpdateBannerRequestSchema = AddBannerRequestSchema.partial();

export type ZodAddBannerRequestSchema = z.infer<typeof AddBannerRequestSchema>;
export type ZodUpdateBannerRequestSchema = z.infer<typeof UpdateBannerRequestSchema>;

export const { schemas: bannerSchemas, $ref } = buildJsonSchemas(
  {
    AddBannerRequestSchema,
    UpdateBannerRequestSchema,
  },
  { $id: "bannerSchemas" }
);
