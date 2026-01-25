import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../../utils/Prisma";
import {
  ZodAddCartRequestSchema,
  ZodDeleteCartRequestSchema,
} from "./cart.schema";

export const addProductsToCart = async (
  request: FastifyRequest<{ Body: ZodAddCartRequestSchema }>,
  reply: FastifyReply
) => {
  try {
    const { productId, attributeId, cartId } = request.body;

    const productData = await prisma.attributeProduct.findUnique({
      where: {
        id: attributeId,
      },
    });

    if (!productData) {
      reply.code(200).send({
        status: false,
        message: "Attribute Id/ Product id is mismatched",
      });
    }

    if (!cartId) {
      const cartData = await prisma.cart.create({
        data: {
          userId: request.user.id,
          discounted_price: productData?.discounted_amount || "",
          mrp_price: productData?.price || "",
          total_price: productData?.selling_price || "",
        },
      });

      await prisma.cartItem.create({
        data: {
          productId: attributeId,
          discounted_price: productData?.discounted_amount || "",
          mrp_price: productData?.price || "",
          total_price: productData?.selling_price || "",
          selected_quantity: "1",
          cartId: cartData.id,
        },
      });

      reply.code(200).send({
        status: true,
        data: cartData,
        message: "Cart Added Successfully",
      });
    } else {
      const cartItemData = await prisma.cartItem.findMany({
        where: {
          cartId: cartId,
        },
      });

      const { discounted_price, mrp_price, total_price } = cartItemData?.reduce(
        (a, b) => {
          a.discounted_price = String(
            Number(a?.discounted_price || 0) + Number(b?.discounted_price)
          );
          a.mrp_price = String(Number(a?.mrp_price || 0) + Number(b?.mrp_price));
          a.total_price = String(Number(a?.total_price || 0) + Number(b?.total_price));
          return a;
        }, { discounted_price: '0', mrp_price: "0", total_price: "0" }
      );

      const cartData = await prisma.cart.update({
        where: {
          id: cartId,
        },
        data: {
          discounted_price: String(
            productData?.discounted_amount
              ? Number(productData.discounted_amount) + Number(discounted_price)
              : Number(discounted_price)
          ),
          mrp_price: String(
            productData?.price
              ? Number(productData.price) + Number(mrp_price)
              : Number(mrp_price)
          ),
          total_price: String(
            productData?.selling_price
              ? Number(productData.selling_price) + Number(total_price)
              : Number(total_price)
          ),
        },
        include: {
          cart_item: {
            include: {
              product: {
                include: {
                  Product: true,
                },
              },
            },
          },
        },
      });

      await prisma.cartItem.create({
        data: {
          productId: attributeId,
          discounted_price: productData?.discounted_amount || "",
          mrp_price: productData?.price || "",
          total_price: productData?.selling_price || "",
          selected_quantity: "1",
          cartId: cartId,
        },
      });

      reply.code(200).send({
        status: true,
        message: "Added Successfully",
        data: cartData,
      });
    }
  } catch (err) {
    console.log({ err })
    reply.code(500).send({
      data: err,
      status: false,
      message: "Something went wrong!",
    });
  }
};

export const getAllCartItem = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const cartData = await prisma.cart.findFirst({
      where: {
        userId: request.user.id,
      },
      include: {
        cart_item: {
          include: {
            product: {
              include: {
                Product: true,
              },
            },
          },
        },
      },
    });

    reply.code(200).send({
      status: true,
      data: cartData,
    });
  } catch (err) {
    reply.code(500).send({
      status: false,
      message: "Something went wrong!",
      data: err,
    });
  }
};

export const deleteCartItem = async (
  request: FastifyRequest<{ Body: ZodDeleteCartRequestSchema }>,
  reply: FastifyReply
) => {
  try {
    const { attributeId, cartId, cartItemId } = request.body;

    const productData = await prisma.attributeProduct.findUnique({
      where: {
        id: attributeId,
      },
    });

    if (!productData) {
      reply.code(200).send({
        status: false,
        message: "Product Id/ Attribute Id is mismatched",
      });
    }

    const cartItemData = await prisma.cartItem.findMany({
      where: {
        cartId: cartId,
      },
    });

    if (cartItemData.length > 1) {
      const { discounted_price, mrp_price, total_price } = cartItemData.reduce(
        (a, b) => {
          a.discounted_price = String(
            Number(a.discounted_price) + Number(b.discounted_price)
          );
          a.mrp_price = String(Number(a.mrp_price) + Number(b.mrp_price));
          a.total_price = String(Number(a.total_price) + Number(b.total_price));
          return a;
        }
      );

      console.log({
        discounted_price,
        mrp_price,
        total_price,
      });

      const cartData = await prisma.cart.update({
        where: {
          id: cartId,
          userId: request.user.id,
        },
        data: {
          discounted_price: String(
            productData?.discounted_amount
              ? Number(discounted_price) - Number(productData.discounted_amount)
              : Number(discounted_price)
          ),
          mrp_price: String(
            productData?.price
              ? Number(mrp_price) - Number(productData.price)
              : Number(mrp_price)
          ),
          total_price: String(
            productData?.selling_price
              ? Number(total_price) - Number(productData.selling_price)
              : Number(total_price)
          ),
        },
      });

      await prisma.cartItem.delete({
        where: {
          id: cartItemId,
        },
      });

      reply.code(200).send({
        status: true,
        data: cartData,
        message: "Deleted Successfully",
      });
    } else {
      await prisma.cartItem.delete({
        where: {
          id: cartItemId,
        },
      });

      await prisma.cart.delete({
        where: {
          id: cartId,
        },
      });

      reply.code(200).send({
        status: true,
        data: [],
        message: "Deleted Successfully",
      });
    }
  } catch (err) {
    reply.code(500).send({
      status: false,
      data: err,
      message: "Something went wrong!",
    });
  }
};
