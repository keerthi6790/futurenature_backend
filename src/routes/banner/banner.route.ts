import { FastifyInstance } from "fastify";
import { $ref } from "./banner.schema";
import {
  AddBanner,
  UpdateBanner,
  DeleteBanner,
  ListAllBanners,
  ListBannersByDevice,
} from "./banner.controller";

export async function BannerRoutes(app: FastifyInstance) {
  // Add banner (Admin only)
  app.post(
    "/",
    {
      preHandler: [app.authenticate],
      schema: {
        body: $ref("AddBannerRequestSchema"),
        tags: ["Banner"],
        summary: "Add a new banner (Admin only)",
      },
    },
    AddBanner
  );

  app.post(
    "/add",
    {
      preHandler: [app.authenticate],
      schema: {
        body: $ref("AddBannerRequestSchema"),
        tags: ["Banner"],
        summary: "Add a new banner (Admin only)",
      },
    },
    AddBanner
  );

  // Update banner (Admin only)
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
        body: $ref("UpdateBannerRequestSchema"),
        tags: ["Banner"],
        summary: "Update an existing banner (Admin only)",
      },
    },
    UpdateBanner
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
        body: $ref("UpdateBannerRequestSchema"),
        tags: ["Banner"],
        summary: "Update an existing banner (Admin only)",
      },
    },
    UpdateBanner
  );

  // Delete banner (Admin only)
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
        tags: ["Banner"],
        summary: "Delete a banner (Admin only)",
      },
    },
    DeleteBanner
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
        tags: ["Banner"],
        summary: "Delete a banner (Admin only)",
      },
    },
    DeleteBanner
  );

  // List all banners (optional ?activeOnly=true)
  app.get(
    "/",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            activeOnly: { type: "string" },
          },
        },
        tags: ["Banner"],
        summary: "List all banners",
      },
    },
    ListAllBanners
  );

  // List banners based on device type (?device=desktop|mobile)
  app.get(
    "/device",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            device: { type: "string" },
          },
        },
        tags: ["Banner"],
        summary: "List active banners by device type (desktop/mobile)",
      },
    },
    ListBannersByDevice
  );

  // List banners based on device type param (/device/desktop or /device/mobile)
  app.get(
    "/device/:type",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            type: { type: "string" },
          },
        },
        tags: ["Banner"],
        summary: "List active banners by device type parameter",
      },
    },
    ListBannersByDevice
  );
}
export default BannerRoutes;
