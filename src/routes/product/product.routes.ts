import { FastifyInstance } from "fastify";
import { $ref } from "./product.schema";
import {
  AddProducts,
  getSpecificProductData,
  listAllProducts,
} from "./product.controller";

export async function ProductRoutes(app: FastifyInstance) {
  app.post(
    "/add",
    {
      preHandler: [app.authenticate],
      schema: {
        body: $ref("AddProductsRequestSchme"),
      },
    },
    AddProducts
  );

  app.get("/fetchProducts", listAllProducts);

  app.get("/getProductInfo/:id", getSpecificProductData);
}
