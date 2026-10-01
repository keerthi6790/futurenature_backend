import { FastifyInstance } from "fastify";
import { $ref } from "./category.schema";
import {
  AddCategory,
  UpdateCategory,
  DeleteCategory,
  ListCategories,
  GetCategoryById,
  AssignProductsToCategory,
} from "./category.controller";

export async function CategoryRoutes(app: FastifyInstance) {
  // Add category (Admin only)
  app.post(
    "/",
    {
      preHandler: [app.authenticate],
      schema: {
        body: $ref("AddCategoryRequestSchema"),
        tags: ["Category"],
        summary: "Add a new category (Admin only)",
      },
    },
    AddCategory
  );

  app.post(
    "/add",
    {
      preHandler: [app.authenticate],
      schema: {
        body: $ref("AddCategoryRequestSchema"),
        tags: ["Category"],
        summary: "Add a new category (Admin only)",
      },
    },
    AddCategory
  );

  // Assign products to category (Admin only)
  app.post(
    "/:id/assign",
    {
      preHandler: [app.authenticate],
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
        body: $ref("AssignProductsRequestSchema"),
        tags: ["Category"],
        summary: "Assign products to category (Admin only)",
      },
    },
    AssignProductsToCategory
  );

  app.post(
    "/assign",
    {
      preHandler: [app.authenticate],
      schema: {
        body: $ref("AssignProductsRequestSchema"),
        tags: ["Category"],
        summary: "Assign products to category (Admin only)",
      },
    },
    AssignProductsToCategory
  );

  // Update category (Admin only)
  app.put(
    "/:id",
    {
      preHandler: [app.authenticate],
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
        body: $ref("UpdateCategoryRequestSchema"),
        tags: ["Category"],
        summary: "Update an existing category (Admin only)",
      },
    },
    UpdateCategory
  );

  // Delete category (Admin only)
  app.delete(
    "/:id",
    {
      preHandler: [app.authenticate],
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
        tags: ["Category"],
        summary: "Delete a category (Admin only)",
      },
    },
    DeleteCategory
  );

  // List all categories
  app.get(
    "/",
    {
      schema: {
        tags: ["Category"],
        summary: "List all categories",
      },
    },
    ListCategories
  );

  app.get(
    "/all",
    {
      schema: {
        tags: ["Category"],
        summary: "List all categories",
      },
    },
    ListCategories
  );

  // Get specific category
  app.get(
    "/:id",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
        tags: ["Category"],
        summary: "Get specific category with its products",
      },
    },
    GetCategoryById
  );
}

export default CategoryRoutes;

