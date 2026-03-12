import { FastifyInstance } from "fastify";
import {
  getUserData,
  RegisterUser,
  triggerOtp,
  verifyOtp,
} from "./user.controller";
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
        tags: ["User"],
        summary: "Trigger OTP for mobile number",
        description:
          "Generates a 6-digit OTP and saves/updates it in the database using `prisma.otp.upsert`.",
      },
    },
    triggerOtp,
  );

  app.post(
    "/verifyOtp",
    {
      schema: {
        body: $ref("VerityOtpRequestSchema"),
        tags: ["User"],
        summary: "Verify OTP and login/register",
        description:
          "Verifies the OTP against the database (`prisma.otp.findUnique`). If valid, it either finds an existing user (`prisma.user.findUnique`) or creates a new one (`prisma.user.create`). Returns a JWT token.",
      },
    },
    verifyOtp,
  );

  app.post(
    "/register",
    {
      schema: {
        body: $ref("CreateUserRequestSchema"),
        response: {
          201: $ref("CreateUserResponseSchema"),
        },
        tags: ["User"],
        summary: "Register user details",
        description:
          "Updates the user's profile with first name, last name, and hashed password using `prisma.user.update`. Requires authentication.",
      },
    },
    RegisterUser,
  );

  app.get(
    "/userData",
    {
      preHandler: [app.authenticate],
    },
    getUserData,
  );
}
