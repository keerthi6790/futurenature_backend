import { FastifyInstance } from "fastify";
import {
  addProductsToCart,
  deleteCartItem,
  getAllCartItem,
} from "./cart.controller";
import { $ref } from "./cart.schema";

export const CartRoutes = async (app: FastifyInstance) => {
  app.post(
    "/add",
    {
      preHandler: [app.authenticate],
      schema: {
        body: $ref("AddCartRequestSchema"),
      },
    },
    addProductsToCart
  );

  app.get("/all", { preHandler: [app.authenticate] }, getAllCartItem);

  app.delete(
    "/delete",
    {
      preHandler: [app.authenticate],
      schema: {
        body: $ref("DeleteCartRequestSchema"),
      },
    },
    deleteCartItem
  );
};
