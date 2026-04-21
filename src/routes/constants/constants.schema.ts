import { buildJsonSchemas } from "fastify-zod";
import * as z from "zod";

const EditConstantsRequestSchema = z.object({
  freeDelivery: z.string(),
  deliveryChargeTamilNadu: z.string(),
  deliveryChargeOutsideTamilNadu: z.string(),
});

export type ZodEditConstantsRequestSchema = z.infer<
  typeof EditConstantsRequestSchema
>;

export const { schemas: constantsSchema, $ref } = buildJsonSchemas(
  {
    EditConstantsRequestSchema,
  },
  { $id: "constantsSchema" },
);
