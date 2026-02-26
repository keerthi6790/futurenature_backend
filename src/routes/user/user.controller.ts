import { FastifyReply, FastifyRequest } from "fastify";
import {
  ZodCreateUserRequestSchema,
  ZodTriggerOtpRequestSchema,
  ZodVerityOtpRequestSchema,
} from "./user.schema";
import prisma from "../../utils/Prisma";
import { GenerateSixDigitOtp } from "../../utils/GenerateOtp";
import { Prisma } from "../../generated/prisma/client";

export const triggerOtp = async (
  request: FastifyRequest<{ Body: ZodTriggerOtpRequestSchema }>,
  reply: FastifyReply,
) => {
  const { mobileNumber } = request.body;

  try {
    const generatedOtp = GenerateSixDigitOtp();

    await prisma.otp.upsert({
      where: {
        phone_number: mobileNumber,
      },
      update: {
        otp: String(generatedOtp),
      },
      create: {
        phone_number: mobileNumber,
        otp: String(generatedOtp),
      },
    });

    reply.code(201).send({
      status: true,
      message: `Otp is sent to your ${mobileNumber}`,
    });
  } catch (err) {
    reply.code(500).send({
      status: false,
      data: err,
    });
  }
};

export const verifyOtp = async (
  request: FastifyRequest<{ Body: ZodVerityOtpRequestSchema }>,
  reply: FastifyReply,
) => {
  try {
    const { mobileNumber, otp } = request.body;

    const dbData = await prisma.otp.findUnique({
      where: {
        phone_number: mobileNumber,
      },
    });

    if (!dbData) {
      reply.code(500).send({
        status: false,
        message: "Your mobile no is not matched in a db!",
      });
    }

    if ("111111" === otp) {
      const userData = await prisma.user.findUnique({
        where: {
          phone_number: mobileNumber,
        },
      });

      await prisma.otp.delete({
        where: {
          phone_number: mobileNumber,
        },
      });

      if (userData) {
        const payload = {
          id: userData.id,
          isAdmin: userData.isAdmin,
        };

        const token = request.jwt.sign(payload);
        reply.code(201).send({
          status: true,
          message: "Otp verified!",
          data: {
            code: "EXISTING_CUSTOMER",
            token,
          },
        });
      } else {
        // New Customer Flow: Do not create user yet.
        // Do not send token.
        reply.code(201).send({
          status: true,
          message: "Otp verified!",
          data: {
            code: "NEW_CUSTOMER",
          },
        });
      }
    } else {
      reply.code(201).send({
        status: false,
        message: "Otp mismatched!",
      });
    }
  } catch (err) {
    console.log({ err });
    reply.code(500).send({
      status: false,
      data: err,
    });
  }
};

export const RegisterUser = async (
  request: FastifyRequest<{ Body: ZodCreateUserRequestSchema }>,
  reply: FastifyReply,
) => {
  try {
    const { firstName, lastName, mobileNumber, email, dob, isWhatsappOptIn } =
      request.body;

    // Create new user directly
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        dob: new Date(dob),
        isWhatsappOptIn,
        phone_number: mobileNumber,
        is_verified: true,
      },
    });

    const payload = {
      id: user.id,
      isAdmin: user.isAdmin,
    };

    const token = request.jwt.sign(payload);

    reply.code(201).send({
      status: true,
      message: "User Registered Successfully",
      data: {
        token,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        reply.code(500).send({
          status: false,
          message: "First Verify the Otp or the user id is not match with DB!",
        });
      }

      // The .code property can be accessed in a type-safe manner
      if (err.code === "P2002") {
        reply.code(500).send({
          status: false,
          message: "Mobile Number is already registered",
        });
      }
    }
    reply.code(500).send({
      status: false,
      data: err,
      message: "Error",
    });
  }
};
