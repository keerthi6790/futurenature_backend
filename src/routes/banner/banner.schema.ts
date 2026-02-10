import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

const bannerCore = {
    imageUrl: z.string({
        required_error: "Image URL is required",
    }),
    isActive: z.boolean().optional().default(true),
};

const addBannerSchema = z.object({
    ...bannerCore,
});

const updateBannerSchema = z.object({
    imageUrl: z.string().optional(),
    isActive: z.boolean().optional(),
});

const bannerResponseSchema = z.object({
    id: z.string(),
    ...bannerCore,
    createdAt: z.date(),
    updatedAt: z.date(),
});

const bannersResponseSchema = z.array(bannerResponseSchema);

export type ZodAddBannerRequest = z.infer<typeof addBannerSchema>;
export type ZodUpdateBannerRequest = z.infer<typeof updateBannerSchema>;

export const { schemas: bannerSchemas, $ref } = buildJsonSchemas(
    {
        addBannerSchema,
        updateBannerSchema,
        bannerResponseSchema,
        bannersResponseSchema,
    },
    { $id: "bannerSchema" },
);
