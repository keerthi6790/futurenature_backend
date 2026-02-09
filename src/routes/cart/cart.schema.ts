import { buildJsonSchemas } from "fastify-zod";
import * as z from "zod";

const AddCartRequestSchema = z.object({
  productId: z.string({
    required_error: "Product Id is mandatory",
  }),
  cartId: z.string().optional(),
});

const DeleteCartRequestSchema = z.object({
  cartItemId: z.string({
    required_error: "Cart Item Id is mandatory",
  }),
  cartId: z.string({
    required_error: "Cart Id is mandatory",
  }),
});

const UpdateCartQuantityRequestSchema = z.object({
  cartItemId: z.string({
    required_error: "Cart Item Id is mandatory",
  }),
  quantity: z.number({
    required_error: "Quantity is mandatory",
  }),
  cartId: z.string({
    required_error: "Cart Id is mandatory",
  }),
});

export type ZodAddCartRequestSchema = z.infer<typeof AddCartRequestSchema>;
export type ZodDeleteCartRequestSchema = z.infer<
  typeof DeleteCartRequestSchema
>;
export type ZodUpdateCartQuantityRequestSchema = z.infer<
  typeof UpdateCartQuantityRequestSchema
>;

export const { schemas: cartSchema, $ref } = buildJsonSchemas(
  {
    AddCartRequestSchema,
    DeleteCartRequestSchema,
    UpdateCartQuantityRequestSchema,
  },
  { $id: "cartSchema" }
);
