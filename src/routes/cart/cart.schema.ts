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

const UpdateAddressToCart = z.object({
  cartId: z.string({
    required_error: "Cart Id is mandatory",
  }),
  addressId: z.string({
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
export type ZODUpdateAddressToCart = z.infer<typeof UpdateAddressToCart>;

export const { schemas: cartSchema, $ref } = buildJsonSchemas(
  {
    AddCartRequestSchema,
    DeleteCartRequestSchema,
    UpdateCartQuantityRequestSchema,
    UpdateAddressToCart,
  },
  { $id: "cartSchema" },
);
