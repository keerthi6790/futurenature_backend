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
      },
      preHandler: [app.authenticate],
    },
    addAddress
  );

  app.get(
    "/alladdress",
    {
      preHandler: [app.authenticate],
    },
    GetAllUserAddress
  );

  app.delete(
    "/delete/:id",
    {
      preHandler: [app.authenticate],
    },
    deleteAddress
  );

  app.put(
    "/edit/:id",
    {
      preHandler: [app.authenticate],
      schema: {
        body: $ref("EditAddressRequestSchema"),
      },
    },
    editAddress
  );
}
