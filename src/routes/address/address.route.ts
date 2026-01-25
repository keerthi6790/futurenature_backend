import { FastifyInstance } from "fastify";
import { $ref } from "./address.schema";
import {
  addAddress,
  deleteAddress,
  editAddress,
  GetAllUserAddress,
} from "./address.controller";

export async function AddressRoutes(app: FastifyInstance) {
  app.post(
    "/add",
    {
      schema: {
        body: $ref("AddAddressRequestSchema"),
        tags: ["Address"],
        summary: "Add a new address",
        description:
          "Creates a new address for the authenticated user using `prisma.address.create`.",
      },
      preHandler: [app.authenticate],
    },
    addAddress
  );

  app.get(
    "/alladdress",
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ["Address"],
        summary: "Get all addresses for the user",
        description:
          "Fetches all addresses associated with the authenticated user using `prisma.address.findMany`.",
      },
    },
    GetAllUserAddress
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
        tags: ["Address"],
        summary: "Delete an address",
        description:
          "Deletes a specific address using `prisma.address.delete`. Requires authentication.",
      },
    },
    deleteAddress
  );

  app.put(
    "/edit/:id",
    {
      preHandler: [app.authenticate],
      schema: {
        body: $ref("EditAddressRequestSchema"),
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
        tags: ["Address"],
        summary: "Edit an address",
        description:
          "Updates an existing address using `prisma.address.update`. Requires authentication.",
      },
    },
    editAddress
  );
}
