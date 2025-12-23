import { FastifyInstance } from "fastify";
import { RegisterUser, triggerOtp, verifyOtp } from "./user.controller";
import { $ref } from "./user.schema";

export async function UserRoutes(app: FastifyInstance) {
  app.post(
    "/triggerOtp",
    {
      schema: {
        body: $ref("TriggerOtpRequestSchema"),
        response: {
          201: $ref("ResponseSchema"),
        },
      },
    },
    triggerOtp
  );

  app.post(
    "/verifyOtp",
    {
      schema: {
        body: $ref("VerityOtpRequestSchema"),
      },
    },
    verifyOtp
  );

  app.post(
    "/register",
    {
      preHandler: [app.authenticate],
      schema: {
        body: $ref("CreateUserRequestSchema"),
        response: {
          201: $ref("CreateUserResponseSchema"),
        },
      },
    },
    RegisterUser
  );
}
