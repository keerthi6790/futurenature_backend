import { FastifyInstance } from "fastify";
import { $ref } from "./product.schema";
import {
  AddProducts,
  DeleteProduct,
  getSpecificProductData,
  listAllProducts,
  RestoreProduct,
  getDailyDeals,
  toggleDailyDeal,
  UpdateProduct,
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

  app.put(
    "/update/:id",
    {
      preHandler: [app.authenticate],
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
        body: $ref("UpdateProductsRequestSchme"),
        tags: ["Product"],
        summary: "Update an existing product (Admin only)",
        description:
          "Updates product details and replaces variants. Requires admin authentication.",
      },
    },
    UpdateProduct
  );

  app.delete(
    "/delete/:id",
    {
      preHandler: [app.authenticate],
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
        tags: ["Product"],
        summary: "Delete a product (Admin only)",
        description:
          "Deletes a product and its associated variants. Requires admin authentication.",
      },
    },
    DeleteProduct
  );

  app.post(
    "/restore/:id",
    {
      preHandler: [app.authenticate],
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
        tags: ["Product"],
        summary: "Restore a deleted product (Admin only)",
      },
    },
    RestoreProduct
  );

  app.get(
    "/daily-deals",
    {
      schema: {
        tags: ["Product"],
        summary: "Get all daily deals",
      },
    },
    getDailyDeals
  );

  app.post(
    "/toggle-daily-deal/:id",
    {
      preHandler: [app.authenticate],
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
        body: {
          type: "object",
          properties: {
            isDailyDeals: { type: "boolean" },
          },
        },
        tags: ["Product"],
        summary: "Add/Remove product from daily deals (Admin only)",
      },
    },
    toggleDailyDeal
  );
}
