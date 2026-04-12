import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../../utils/Prisma";

export const getOrderById = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) => {
  try {
    const { id } = request.params;
    const userId = (request.user as any).id;

    const order = await prisma.order.findUnique({
      where: { id, userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
      },
    });

    if (!order) {
      return reply.code(404).send({
        status: false,
        message: "Order not found",
      });
    }

    reply.code(200).send({
      status: true,
      data: {
        ...order,
        shippingPrice: order.shippingPrice,
      },
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    reply.code(500).send({
      status: false,
      message: "Something went wrong fetching order",
    });
  }
};

export const getMyOrders = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const userId = (request.user as any).id;

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
      },
    });
    // Add shippingPrice to each order in response
    const ordersWithShipping = orders.map((order) => ({
      ...order,
      shippingPrice: order.shippingPrice,
    }));
    reply.code(200).send({
      status: true,
      data: ordersWithShipping,
    });
    return;

    reply.code(200).send({
      status: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    reply.code(500).send({
      status: false,
      message: "Something went wrong fetching orders",
    });
  }
};
