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
      return reply.code(200).send({
        status: false,
        message: "Attribute Id/ Product id is mismatched",
      });
    }

    if (!cartId) {
      // Create new cart
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
      // Check if item already exists in cart AND Belongs to this user (optional security but good practice, though cartId should be unique)
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          cartId: cartId,
          productId: attributeId,
        },
      });

      if (existingItem) {
        // Update existing item
        const newQuantity = Number(existingItem.selected_quantity) + 1;

        // Calculate new prices for this item
        const newDiscountedPrice = String(Number(productData.discounted_amount || 0) * newQuantity);
        const newMrpPrice = String(Number(productData.price || 0) * newQuantity);
        const newTotalPrice = String(Number(productData.selling_price || 0) * newQuantity);

        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            selected_quantity: String(newQuantity),
            discounted_price: newDiscountedPrice,
            mrp_price: newMrpPrice,
            total_price: newTotalPrice
          }
        });

      } else {
        // Create new item
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
      }

      // Finally, recalculate Cart totals from scratch to ensure accuracy
      const allCartItems = await prisma.cartItem.findMany({
        where: { cartId: cartId }
      });

      const { totalDiscounted, totalMrp, totalSelling } = allCartItems.reduce(
        (acc, item) => {
          acc.totalDiscounted += Number(item.discounted_price || 0);
          acc.totalMrp += Number(item.mrp_price || 0);
          acc.totalSelling += Number(item.total_price || 0);
          return acc;
        },
        { totalDiscounted: 0, totalMrp: 0, totalSelling: 0 }
      );

      const cartData = await prisma.cart.update({
        where: { id: cartId },
        data: {
          discounted_price: String(totalDiscounted),
          mrp_price: String(totalMrp),
          total_price: String(totalSelling),
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
        message: existingItem ? "Cart Updated Successfully" : "Added Successfully",
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
