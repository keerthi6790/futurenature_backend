import { FastifyInstance } from "fastify";
import { editConstants, getConstants } from "./constants.controller";
import { $ref } from "./constants.schema";

export const ConstantsRoutes = async (app: FastifyInstance) => {
  app.get(
    "/all",
    {
      preHandler: [app.authenticate],
    },
    getConstants,
  );

  app.put(
    "/edit",
    {
      preHandler: [app.authenticate],
      schema: $ref("EditConstantsRequestSchema"),
    },
    editConstants,
  );
};
