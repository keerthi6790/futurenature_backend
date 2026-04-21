import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../../utils/Prisma";
import {
  ZodAddCartRequestSchema,
  ZodDeleteCartRequestSchema,
  ZODUpdateAddressToCart,
  ZodUpdateCartQuantityRequestSchema,
} from "./cart.schema";

export const addProductsToCart = async (
  request: FastifyRequest<{ Body: ZodAddCartRequestSchema }>,
  reply: FastifyReply,
) => {
  try {
    const { productId, cartId: providedCartId } = request.body;
    const userId = (request.user as any).id;

    console.log(
      `[AddCart] User: ${userId}, Product: ${productId}, ProvidedCartId: ${providedCartId}`,
    );

    // 1. Fetch Product Data
    const productData = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!productData || productData.isDeleted) {
      console.log(`[AddCart] Product not found or deleted: ${productId}`);
      return reply.code(200).send({
        status: false,
        message: "Product not available",
      });
    }

    if (productData.available_quantity <= 0) {
      return reply.code(200).send({
        status: false,
        message: "Product is out of stock",
      });
    }

    // 2. Resolve Cart ID (Find existing or leave for creation)
    let finalCartId = providedCartId;

    if (!finalCartId) {
      const existingCart = await prisma.cart.findUnique({
        where: { userId: userId },
      });
      if (existingCart) {
        finalCartId = existingCart.id;
        console.log(`[AddCart] Found existing cart for user: ${finalCartId}`);
      }
    }

    let cartData;

    if (!finalCartId) {
      console.log(`[AddCart] Creating new cart for user: ${userId}`);
      // 3a. Create new cart if none exists
      cartData = await prisma.cart.create({
        data: {
          userId: userId,
          discounted_price: productData.discounted_amount || "0",
          mrp_price: productData.price || "0",
          total_price: productData.selling_price || "0",
          shippingPrice: "0",
        },
      });
      finalCartId = cartData.id;

      await prisma.$transaction([
        prisma.cartItem.create({
          data: {
            productId: productId,
            discounted_price: productData.discounted_amount || "0",
            mrp_price: productData.price || "0",
            total_price: productData.selling_price || "0",
            selected_quantity: "1",
            cartId: finalCartId,
          },
        }),
        prisma.product.update({
          where: { id: productId },
          data: { available_quantity: { decrement: 1 } },
        }),
      ]);
    } else {
      console.log(`[AddCart] Adding to existing cart: ${finalCartId}`);

      const existingcartData = await prisma.cart.findFirst({
        where: {
          id: finalCartId,
        },
        include: {
          address: true,
        },
      });
      // 3b. Add to existing cart
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          cartId: finalCartId,
          productId: productId,
        },
      });

      if (existingItem) {
        console.log(
          `[AddCart] Item exists, updating quantity: ${existingItem.id}`,
        );
        const newQuantity = Number(existingItem.selected_quantity) + 1;
        const newDiscountedPrice = String(
          Number(productData.discounted_amount || 0) * newQuantity,
        );
        const newMrpPrice = String(
          Number(productData.price || 0) * newQuantity,
        );
        const newTotalPrice = String(
          Number(productData.selling_price || 0) * newQuantity,
        );

        await prisma.$transaction([
          prisma.cartItem.update({
            where: { id: existingItem.id },
            data: {
              selected_quantity: String(newQuantity),
              discounted_price: newDiscountedPrice,
              mrp_price: newMrpPrice,
              total_price: newTotalPrice,
            },
          }),
          prisma.product.update({
            where: { id: productId },
            data: { available_quantity: { decrement: 1 } },
          }),
        ]);
      } else {
        console.log(`[AddCart] Item not in cart, creating new CartItem`);
        await prisma.$transaction([
          prisma.cartItem.create({
            data: {
              productId: productId,
              discounted_price: productData.discounted_amount || "0",
              mrp_price: productData.price || "0",
              total_price: productData.selling_price || "0",
              selected_quantity: "1",
              cartId: finalCartId,
            },
          }),
          prisma.product.update({
            where: { id: productId },
            data: { available_quantity: { decrement: 1 } },
          }),
        ]);
      }

      // 4. Recalculate Cart totals and Cleanup orphans
      const allItems = await prisma.cartItem.findMany({
        where: { cartId: finalCartId },
      });
      const productIds = allItems.map((item) => item.productId);
      const existingProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true },
      });
      const existingProductIds = new Set(existingProducts.map((p) => p.id));
      const orphanItems = allItems.filter(
        (item) => !existingProductIds.has(item.productId),
      );

      if (orphanItems.length > 0) {
        console.log(
          `[AddCart] Cleaning up ${orphanItems.length} orphan items for cart ${finalCartId}`,
        );
        await prisma.cartItem.deleteMany({
          where: { id: { in: orphanItems.map((i) => i.id) } },
        });
      }

      const validItems = allItems.filter((item) =>
        existingProductIds.has(item.productId),
      );

      const totals = validItems.reduce(
        (acc, item) => {
          acc.totalDiscounted += Number(item.discounted_price || 0);
          acc.totalMrp += Number(item.mrp_price || 0);
          acc.totalSelling += Number(item.total_price || 0);
          acc.quantity += Number(item.selected_quantity || 0);
          return acc;
        },
        { totalDiscounted: 0, totalMrp: 0, totalSelling: 0, quantity: 0 },
      );

      const data = await prisma.constants.findMany();

      const isFreeDelivery =
        data?.find((da) => da.id === "1")?.boolean === "TRUE";
      const tamilNadu = data?.find((da) => da.id === "2")?.boolean || "0";
      const outSideTamilnadu =
        data?.find((da) => da.id === "3")?.boolean || "0";

      const shippingPrice = isFreeDelivery
        ? 0
        : existingcartData?.address?.state === "Tamil Nadu"
          ? +tamilNadu
          : +outSideTamilnadu;

      cartData = await prisma.cart.update({
        where: { id: finalCartId },
        data: {
          discounted_price: String(totals.totalDiscounted),
          mrp_price: String(totals.totalMrp),
          total_price: String(
            totals.totalSelling + totals.quantity * shippingPrice,
          ),
          shippingPrice: String(totals.quantity * shippingPrice),
        },
        include: {
          cart_item: {
            where: {
              productId: { in: Array.from(existingProductIds) },
            },
            include: {
              product: true,
            },
          },
        },
      });
    }

    reply.code(200).send({
      status: true,
      message: "Cart processed successfully",
      data: cartData,
    });
  } catch (err: any) {
    console.error("[AddCart] ERROR:", err);
    reply.code(500).send({
      data: {
        name: err.name,
        message: err.message,
        code: err.code,
        meta: err.meta,
        clientVersion: err.clientVersion,
      },
      status: false,
      message: "Something went wrong!",
    });
  }
};

export const getAllCartItem = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const userId = (request.user as any).id;

    // 1. Find Cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      return reply.code(200).send({
        status: true,
        data: null,
        cartId: "0",
      });
    }

    // 2. Expiry Check (7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    if (cart.createdAt < sevenDaysAgo) {
      console.log(
        `[GetCart] Cart ${cart.id} expired. Clearing and restoring stock.`,
      );

      const items = await prisma.cartItem.findMany({
        where: { cartId: cart.id },
      });

      // Restore stock for all items
      await prisma.$transaction(async (tx) => {
        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              available_quantity: { increment: Number(item.selected_quantity) },
            },
          });
        }
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        await tx.cart.delete({ where: { id: cart.id } });
      });

      return reply.code(200).send({
        status: true,
        data: null,
        cartId: "0",
        message: "Cart expired and stock restored",
      });
    }

    // 3. Cleanup orphans before fetching
    const allItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
    });
    const productIds = allItems.map((item) => item.productId);
    const existingProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true },
    });
    const existingProductIds = new Set(existingProducts.map((p) => p.id));
    const orphanItemIds = allItems
      .filter((item) => !existingProductIds.has(item.productId))
      .map((item) => item.id);

    if (orphanItemIds.length > 0) {
      await prisma.cartItem.deleteMany({
        where: { id: { in: orphanItemIds } },
      });
    }

    // 3. Fetch consistent data
    const cartData = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        address: true,
        cart_item: {
          include: {
            product: true,
          },
        },
      },
    });

    reply.code(200).send({
      status: true,
      data: cartData,
      cartId: cartData?.id || "0",
    });
  } catch (err) {
    console.error("[GetCart] ERROR:", err);
    reply.code(500).send({
      status: false,
      message: "Something went wrong!",
      data: err,
    });
  }
};

export const deleteCartItem = async (
  request: FastifyRequest<{ Body: ZodDeleteCartRequestSchema }>,
  reply: FastifyReply,
) => {
  try {
    const { cartId, cartItemId } = request.body;
    const userId = (request.user as any).id;

    console.log(
      `[DeleteCart] CartId: ${cartId}, ItemId: ${cartItemId}, User: ${userId}`,
    );

    // Find the item, supporting both primary key (id) or productId fallback
    const cartItemToDelete = await prisma.cartItem.findFirst({
      where: {
        AND: [
          {
            OR: [{ id: cartItemId }, { productId: cartItemId }],
          },
          { cartId: cartId },
          { cart: { userId: userId } },
        ],
      },
      include: { product: true },
    });

    if (!cartItemToDelete) {
      console.log(`[DeleteCart] Item not found for deletion: ${cartItemId}`);
      return reply.code(200).send({
        status: false,
        message: "Cart item not found",
      });
    }

    const targetItemId = cartItemToDelete.id;

    const cartItems = await prisma.cartItem.findMany({
      where: {
        cartId: cartId,
      },
    });

    if (cartItems.length > 1) {
      await prisma.$transaction([
        prisma.cartItem.delete({
          where: {
            id: targetItemId,
          },
        }),
        prisma.product.update({
          where: { id: cartItemToDelete.productId },
          data: {
            available_quantity: {
              increment: Number(cartItemToDelete.selected_quantity),
            },
          },
        }),
      ]);

      // Recalculate totals
      const remainingItems = await prisma.cartItem.findMany({
        where: { cartId: cartId },
      });

      const { totalDiscounted, totalMrp, totalSelling, totalQuantity } =
        remainingItems.reduce(
          (acc, item) => {
            acc.totalDiscounted += Number(item.discounted_price || 0);
            acc.totalMrp += Number(item.mrp_price || 0);
            acc.totalSelling += Number(item.total_price || 0);
            acc.totalQuantity += Number(item.selected_quantity || 0);
            return acc;
          },
          {
            totalDiscounted: 0,
            totalMrp: 0,
            totalSelling: 0,
            totalQuantity: 0,
          },
        );

      const exisitingCartData = await prisma.cart.findFirst({
        where: {
          id: cartId,
        },
        include: {
          address: true,
        },
      });

      const data = await prisma.constants.findMany();

      const isFreeDelivery =
        data?.find((da) => da.id === "1")?.boolean === "TRUE";
      const tamilNadu = data?.find((da) => da.id === "2")?.boolean || "0";
      const outSideTamilnadu =
        data?.find((da) => da.id === "3")?.boolean || "0";

      const shippingPrice = isFreeDelivery
        ? 0
        : exisitingCartData?.address?.state === "Tamil Nadu"
          ? +tamilNadu
          : +outSideTamilnadu;

      const cartData = await prisma.cart.update({
        where: {
          id: cartId,
          userId: (request.user as any).id,
        },
        data: {
          discounted_price: String(totalDiscounted),
          mrp_price: String(totalMrp),
          total_price: String(totalSelling + totalQuantity * shippingPrice),
          shippingPrice: String(totalQuantity * shippingPrice),
        },
      });

      reply.code(200).send({
        status: true,
        data: cartData,
        cartId: cartData.id,
        message: "Deleted Successfully",
      });
    } else {
      await prisma.$transaction([
        prisma.cartItem.delete({
          where: {
            id: targetItemId,
          },
        }),
        prisma.product.update({
          where: { id: cartItemToDelete.productId },
          data: {
            available_quantity: {
              increment: Number(cartItemToDelete.selected_quantity),
            },
          },
        }),
        prisma.cart.delete({
          where: {
            id: cartId,
          },
        }),
      ]);

      reply.code(200).send({
        status: true,
        data: [],
        cartId: "0",
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

export const updateCartItemQuantity = async (
  request: FastifyRequest<{ Body: ZodUpdateCartQuantityRequestSchema }>,
  reply: FastifyReply,
) => {
  try {
    const { cartId, cartItemId, quantity } = request.body;
    const userId = (request.user as any).id;

    console.log(
      `[UpdateQty] User: ${userId}, Cart: ${cartId}, Item: ${cartItemId}, Qty: ${quantity}`,
    );

    if (quantity <= 0) {
      return deleteCartItem(request as any, reply);
    }

    // 1. Find the item and verify ownership
    const item = await prisma.cartItem.findFirst({
      where: {
        AND: [
          {
            OR: [{ id: cartItemId }, { productId: cartItemId }],
          },
          { cartId: cartId },
          { cart: { userId: userId } },
        ],
      },
      include: { product: true },
    });

    if (!item) {
      console.log(`[UpdateQty] Item not found: ${cartItemId}`);
      return reply.code(200).send({
        status: false,
        message: "Cart item not found",
      });
    }

    const product = item.product;
    const oldQuantity = Number(item.selected_quantity);
    const quantityDelta = quantity - oldQuantity;

    if (quantityDelta > 0 && product.available_quantity < quantityDelta) {
      return reply.code(200).send({
        status: false,
        message: `Only ${product.available_quantity} more items available`,
      });
    }

    // 2. Update the item and product stock
    const newDiscountedPrice = String(
      Number(product.discounted_amount || 0) * quantity,
    );
    const newMrpPrice = String(Number(product.price || 0) * quantity);
    const newTotalPrice = String(Number(product.selling_price || 0) * quantity);

    await prisma.$transaction([
      prisma.cartItem.update({
        where: { id: item.id },
        data: {
          selected_quantity: String(quantity),
          discounted_price: newDiscountedPrice,
          mrp_price: newMrpPrice,
          total_price: newTotalPrice,
        },
      }),
      prisma.product.update({
        where: { id: product.id },
        data: { available_quantity: { decrement: quantityDelta } },
      }),
    ]);

    // 3. Recalculate totals
    const allItems = await prisma.cartItem.findMany({
      where: { cartId: cartId },
    });

    const totals = allItems.reduce(
      (acc, i) => {
        acc.totalDiscounted += Number(i.discounted_price || 0);
        acc.totalMrp += Number(i.mrp_price || 0);
        acc.totalSelling += Number(i.total_price || 0);
        acc.quantity += Number(i.selected_quantity || 0);
        return acc;
      },
      { totalDiscounted: 0, totalMrp: 0, totalSelling: 0, quantity: 0 },
    );

    console.log({ allItems });

    const exisitingCartData = await prisma.cart.findFirst({
      where: {
        id: cartId,
      },
      include: {
        address: true,
      },
    });

    const data = await prisma.constants.findMany();

    const isFreeDelivery =
      data?.find((da) => da.id === "1")?.boolean === "TRUE";
    const tamilNadu = data?.find((da) => da.id === "2")?.boolean || "0";
    const outSideTamilnadu = data?.find((da) => da.id === "3")?.boolean || "0";

    const shippingPrice = isFreeDelivery
      ? 0
      : exisitingCartData?.address?.state === "Tamil Nadu"
        ? +tamilNadu
        : +outSideTamilnadu;

    const cartData = await prisma.cart.update({
      where: { id: cartId },
      data: {
        discounted_price: String(totals.totalDiscounted),
        mrp_price: String(totals.totalMrp),
        total_price: String(
          totals.totalSelling + totals.quantity * shippingPrice,
        ),
        shippingPrice: String(totals.quantity * shippingPrice),
      },
      include: {
        cart_item: {
          include: {
            product: true,
          },
        },
      },
    });

    reply.code(200).send({
      status: true,
      message: "Quantity updated successfully",
      data: cartData,
    });
  } catch (err) {
    console.error("[UpdateQty] ERROR:", err);
    reply.code(500).send({
      status: false,
      message: "Something went wrong!",
      data: err,
    });
  }
};

export const updateAddressToCart = async (
  request: FastifyRequest<{ Body: ZODUpdateAddressToCart }>,
  reply: FastifyReply,
) => {
  try {
    const { cartId, addressId } = request.body;
    const userId = (request.user as any).id;

    // 1. Find the item and verify ownership
    const item = await prisma.cart.findFirst({
      where: {
        id: cartId,
      },
      include: {
        cart_item: true,
      },
    });

    console.log({ item });

    if (!item) {
      return reply.code(200).send({
        status: false,
        message: "Cart item not found",
      });
    }

    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
      },
    });

    const allItems = await prisma.cartItem.findMany({
      where: { cartId: cartId },
    });

    const totals = allItems.reduce(
      (acc, i) => {
        acc.totalDiscounted += Number(i.discounted_price || 0);
        acc.totalMrp += Number(i.mrp_price || 0);
        acc.totalSelling += Number(i.total_price || 0);
        acc.quantity += Number(i.selected_quantity || 0);
        return acc;
      },
      { totalDiscounted: 0, totalMrp: 0, totalSelling: 0, quantity: 0 },
    );

    const data = await prisma.constants.findMany();

    const isFreeDelivery =
      data?.find((da) => da.id === "1")?.boolean === "TRUE";
    const tamilNadu = data?.find((da) => da.id === "2")?.boolean || "0";
    const outSideTamilnadu = data?.find((da) => da.id === "3")?.boolean || "0";

    const shippingPrice = isFreeDelivery
      ? 0
      : address?.state === "Tamil Nadu"
        ? +tamilNadu
        : +outSideTamilnadu;

    const totalShippingPrice = shippingPrice * totals.quantity;

    console.log({ shippingPrice, totalShippingPrice });

    await prisma.cart.update({
      where: {
        id: cartId,
      },
      data: {
        addressId: addressId,
        shippingPrice: String(totalShippingPrice),
        total_price: String(totals.totalSelling + totalShippingPrice),
      },
    });

    reply.code(200).send({
      status: true,
      message: "Address updated successfully",
    });
  } catch (err) {
    console.error("[UpdateQty] ERROR:", err);
    reply.code(500).send({
      status: false,
      message: "Something went wrong!",
      data: err,
    });
  }
};
