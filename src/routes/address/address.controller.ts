import { FastifyReply, FastifyRequest } from "fastify";
import {
  ZodAddAddressRequestSchema,
  ZodEditAddressRequestSchema,
} from "./address.schema";
import prisma from "../../utils/Prisma";
import { Prisma } from "../../generated/prisma/client";

export const addAddress = async (
  request: FastifyRequest<{ Body: ZodAddAddressRequestSchema }>,
  reply: FastifyReply
) => {
  try {
    const {
      address1,
      address2,
      address3,
      address4,
      city,
      district,
      mobileNumber,
      pincode,
      state,
    } = request.body;

    const addressData = await prisma.address.create({
      data: {
        address1,
        address2,
        address3,
        address4,
        city,
        district,
        pincode,
        state,
        userId: request.user.id,
        phone_number: mobileNumber,
      },
    });

    reply.code(200).send({
      status: true,
      message: "Address Added Successfully",
      data: addressData,
    });
  } catch (err) {
    reply.code(500).send({
      status: false,
      data: err,
      message: "Error",
    });
  }
};

export const editAddress = async (
  request: FastifyRequest<{
    Params: {
      id: string;
    };
    Body: ZodEditAddressRequestSchema;
  }>,
  reply: FastifyReply
) => {
  try {
    const {
      address1,
      address2,
      address3,
      address4,
      city,
      district,
      mobileNumber,
      pincode,
      state,
    } = request.body;

    const editedAddressData = await prisma.address.update({
      where: {
        id: request.params.id,
        userId: request.user.id,
      },
      data: {
        address1,
        address2,
        address3,
        address4,
        city,
        district,
        pincode,
        state,
        phone_number: mobileNumber,
      },
    });

    reply.code(200).send({
      status: true,
      data: editedAddressData,
      message: "Edited Successfully",
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        reply.code(500).send({
          status: false,
          message: "Either userId or addressId is mismatched",
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

export const GetAllUserAddress = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const addressData = await prisma.address.findMany({
      where: {
        userId: request.user.id,
      },
    });

    reply.code(200).send({
      status: true,
      data: addressData,
      message: "All Address fetched Successfully.",
    });
  } catch (err) {
    reply.code(500).send({
      status: false,
      data: err,
      message: "Error",
    });
  }
};

export const deleteAddress = async (
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply
) => {
  try {
    await prisma.address.delete({
      where: {
        id: request.params.id,
        userId: request.user.id,
      },
    });

    reply.code(200).send({
      status: true,
      message: "Deleted Successfully.",
    });
  } catch (err) {
    reply.code(500).send({
      status: false,
      data: err,
      message: "Something went wrong",
    });
  }
};
