import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../../utils/Prisma";
import { ZodEditConstantsRequestSchema } from "./constants.schema";

export const getConstants = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const data = await prisma.constants.findMany();

    if (data) {
      reply.code(201).send({
        status: true,
        data,
      });
    }
  } catch (err) {
    reply.code(500).send({
      status: false,
      message: "Something went wrong!",
      data: err,
    });
  }
};

export const editConstants = async (
  request: FastifyRequest<{ Body: ZodEditConstantsRequestSchema }>,
  reply: FastifyReply,
) => {
  try {
    const {
      deliveryChargeOutsideTamilNadu,
      deliveryChargeTamilNadu,
      freeDelivery,
    } = request.body;

    if (freeDelivery) {
      await prisma.constants.update({
        where: {
          id: "1",
        },
        data: {
          boolean: String(freeDelivery),
        },
      });
    }
    if (deliveryChargeTamilNadu) {
      await prisma.constants.update({
        where: {
          id: "2",
        },
        data: {
          boolean: String(deliveryChargeTamilNadu),
        },
      });
    }
    if (deliveryChargeOutsideTamilNadu) {
      await prisma.constants.update({
        where: {
          id: "3",
        },
        data: {
          boolean: String(deliveryChargeOutsideTamilNadu),
        },
      });
    }

    reply.code(200).send({
      status: true,
      message: "Edited Successfully",
    });
  } catch (err) {
    reply.code(500).send({
      data: err,
      status: false,
      message: "Something went wrong",
    });
  }
};
