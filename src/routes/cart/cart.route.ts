import { FastifyInstance } from "fastify";
import {
  addProductsToCart,
  deleteCartItem,
  getAllCartItem,
  updateAddressToCart,
  updateCartItemQuantity,
} from "./cart.controller";
import { $ref } from "./cart.schema";

export const CartRoutes = async (app: FastifyInstance) => {
  app.post(
    "/add",
    {
      preHandler: [app.authenticate],
      schema: {
        body: $ref("AddCartRequestSchema"),
        tags: ["Cart"],
        summary: "Add products to cart",
        description:
          "Adds products to the user's cart. Involves `prisma.cart.upsert` and `prisma.cartItem.upsert`.",
      },
    },
    addProductsToCart,
  );

  app.get(
    "/all",
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ["Cart"],
        summary: "Get all cart items",
        description:
          "Fetches all items in the user's cart using `prisma.cart.findUnique` with `include`.",
      },
    },
    getAllCartItem,
  );

  app.delete(
    "/delete",
    {
      preHandler: [app.authenticate],
      schema: {
        body: $ref("DeleteCartRequestSchema"),
        tags: ["Cart"],
        summary: "Delete an item from cart",
        description:
          "Removes an item from the user's cart using `prisma.cartItem.delete`.",
      },
    },
    deleteCartItem,
  );

  app.put(
    "/update-quantity",
    {
      preHandler: [app.authenticate],
      schema: {
        body: $ref("UpdateCartQuantityRequestSchema"),
        tags: ["Cart"],
        summary: "Update item quantity in cart",
        description:
          "Updates the quantity of an item in the user's cart and recalculates totals.",
      },
    },
    updateCartItemQuantity,
  );

  app.put(
    "/update-address",
    {
      preHandler: [app.authenticate],
      schema: {
        body: $ref("UpdateAddressToCart"),
        tags: ["Cart"],
        summary: "Update item quantity in cart",
        description:
          "Updates the quantity of an item in the user's cart and recalculates totals.",
      },
    },
    updateAddressToCart,
  );
};
