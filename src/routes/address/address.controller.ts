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
      receiverName,
      label,
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
        receiverName,
        label,
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

    const { phone_number, ...rest } = addressData;
    reply.code(200).send({
      status: true,
      message: "Address Added Successfully",
      data: { ...rest, mobileNumber: phone_number },
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
      receiverName,
      label,
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
        receiverName,
        label,
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

    const { phone_number, ...rest } = editedAddressData;
    reply.code(200).send({
      status: true,
      data: { ...rest, mobileNumber: phone_number },
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
        isDeleted: false,
      },
    });

    const mappedAddressData = addressData.map((addr) => {
      const { phone_number, ...rest } = addr;
      return { ...rest, mobileNumber: phone_number };
    });

    reply.code(200).send({
      status: true,
      data: mappedAddressData,
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
    await prisma.address.update({
      where: {
        id: request.params.id,
        userId: request.user.id,
      },
      data: {
        isDeleted: true,
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
