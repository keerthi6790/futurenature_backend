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
        tags: ["Product"],
        summary: "Add a new product (Admin only)",
        description:
          "Creates a new product using `prisma.product.create` and its variants using `prisma.attributeProduct.createMany`. Requires admin authentication.",
      },
    },
    AddProducts
  );

  app.get(
    "/fetchProducts",
    {
      schema: {
        tags: ["Product"],
        summary: "List all products",
        description:
          "Fetches a list of all products with selected fields using `prisma.product.findMany`.",
      },
    },
    listAllProducts
  );

  app.get(
    "/products",
    {
      schema: {
        tags: ["Product"],
        summary: "List all products",
        description:
          "Fetches a list of all products with selected fields using `prisma.product.findMany`.",
      },
    },
    listAllProducts
  );

  app.get(
    "/getProductInfo/:id",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
        tags: ["Product"],
        summary: "Get specific product details",
        description:
          "Fetches detailed information for a specific product, including variants and reviews, using `prisma.product.findFirst` with `include`.",
      },
    },
    getSpecificProductData
  );
}
