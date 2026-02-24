import { FastifyReply, FastifyRequest } from "fastify";
import { ZodAddProductsRequestSchme, ZodUpdateProductsRequestSchme } from "./product.schema";
import prisma from "../../utils/Prisma";
import { uploadToS3 } from "../../utils/s3.utils";

export const AddProducts = async (
  request: FastifyRequest<{ Body: ZodAddProductsRequestSchme }>,
  reply: FastifyReply,
) => {
  const {
    description,
    imageUrl,
    price,
    productName,
    descriptionTamil,
    discountedAmount,
    discountedType,
    productNameTamil,
    availableQuantity,
  } = request.body;

  try {
    if (!(request.user as any).isAdmin) {
      reply.code(500).send({
        status: false,
        data: "You don't have an access to add the product",
      });
    }

    let sellingPrice: number = 0;
    if (discountedType === "percentage") {
      sellingPrice = Math.round(+price - +price * (+discountedAmount / 100));
    }
    if (discountedType === "mrp") {
      sellingPrice = Math.round(+price - +discountedAmount);
    }

    const processedImageUrls = await Promise.all(
      imageUrl.map(async (img, index) => {
        if (img.startsWith("data:image/") || img.length > 500) {
          return await uploadToS3(img, `${productName}-${index}.jpg`);
        }
        return img;
      })
    );

    const data = await prisma.product.create({
      data: {
        product_name: productName,
        description: description,
        price: price,
        imageUrl: processedImageUrls,
        description_tamil: descriptionTamil,
        discounted_amount: discountedAmount,
        discounted_type: discountedType,
        product_name_tamil: productNameTamil,
        selling_price: String(sellingPrice),
        available_quantity: availableQuantity ? +availableQuantity : 5,
      },
    });

    reply.code(200).send({
      status: true,
      message: "Added Successfully!",
    });
  } catch (err) {
    reply.code(500).send({
      status: false,
      data: err,
    });
    console.log({ err });
  }
};

export const listAllProducts = async (
  request: FastifyRequest<{ Querystring: { includeDeleted?: string } }>,
  reply: FastifyReply,
) => {
  const { includeDeleted } = request.query;
  try {
    const productData = await prisma.product.findMany({
      where: includeDeleted === "true" ? {} : {
        isDeleted: false,
      },
      select: {
        id: true,
        product_name: true,
        product_name_tamil: true,
        selling_price: true,
        price: true,
        discounted_amount: true,
        imageUrl: true,
        discounted_type: true,
        description: true,
        description_tamil: true,
        overall_rating: true,
        review_count: true,
        isDailyDeals: true,
        available_quantity: true
      },
    });

    reply.code(200).send({
      status: true,
      data: productData,
    });
  } catch (err) {
    reply.code(500).send({
      status: false,
      data: err,
    });
  }
};

export const getSpecificProductData = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) => {
  try {
    const productInfo = await prisma.product.findFirst({
      where: {
        id: request.params.id,
      },
      include: {
        reviews: {
          select: {
            rating: true,
            review: true,

            addedBy: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (productInfo) {
      reply.code(200).send({
        status: true,
        data: productInfo,
      });
    } else {
      reply.code(500).send({
        status: true,
        message: "Product id is invalid",
      });
    }
  } catch (err) {
    reply.code(500).send({
      status: false,
      data: err,
    });
  }
};

export const UpdateProduct = async (
  request: FastifyRequest<{
    Params: { id: string };
    Body: ZodUpdateProductsRequestSchme;
  }>,
  reply: FastifyReply,
) => {
  const { id } = request.params;
  const {
    description,
    imageUrl,
    price,
    productName,
    descriptionTamil,
    discountedAmount,
    discountedType,
    productNameTamil,
    availableQuantity,
  } = request.body;

  try {
    if (!(request.user as any).isAdmin) {
      return reply.code(403).send({
        status: false,
        message: "You don't have access to update products",
      });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return reply.code(404).send({
        status: false,
        message: "Product not found",
      });
    }

    let sellingPrice = parseFloat(existingProduct.selling_price);

    // If base fields are provided, update them
    const updateData: any = {};
    if (productName) updateData.product_name = productName;
    if (productNameTamil) updateData.product_name_tamil = productNameTamil;
    if (description) updateData.description = description;
    if (descriptionTamil) updateData.description_tamil = descriptionTamil;
    if (availableQuantity) updateData.available_quantity = +availableQuantity;
    if (price || discountedAmount || discountedType) {
      const finalPrice = price || existingProduct.price;
      const finalDiscountType =
        discountedType || existingProduct.discounted_type;
      const finalDiscountAmount =
        discountedAmount || existingProduct.discounted_amount;

      if (finalDiscountType === "percentage") {
        sellingPrice = Math.round(+finalPrice - +finalPrice * (+finalDiscountAmount / 100));
      } else if (finalDiscountType === "mrp") {
        sellingPrice = Math.round(+finalPrice - +finalDiscountAmount);
      }

      updateData.price = finalPrice;
      updateData.discounted_type = finalDiscountType;
      updateData.discounted_amount = finalDiscountAmount;
      updateData.selling_price = String(sellingPrice);
    }

    if (imageUrl) {
      updateData.imageUrl = await Promise.all(
        imageUrl.map(async (img, index) => {
          if (img.startsWith("data:image/") || img.length > 500) {
            return await uploadToS3(
              img,
              `${productName || existingProduct.product_name}-${index}.jpg`
            );
          }
          return img;
        })
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    reply.code(200).send({
      status: true,
      message: "Updated Successfully!",
      data: updatedProduct,
    });
  } catch (err) {
    console.error({ err });
    reply.code(500).send({
      status: false,
      data: err,
    });
  }
};

export const DeleteProduct = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) => {
  const { id } = request.params;

  console.log({ id })

  try {
    if (!(request.user as any).isAdmin) {
      return reply.code(403).send({
        status: false,
        message: "You don't have access to delete products",
      });
    }

    // Soft delete the product
    await prisma.product.update({
      where: { id },
      data: { isDeleted: true },
    });

    reply.code(200).send({
      status: true,
      message: "Deleted Successfully!",
    });
  } catch (err) {
    console.error({ err });
    reply.code(500).send({
      status: false,
      data: err,
    });
  }
};

export const RestoreProduct = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) => {
  const { id } = request.params;

  try {
    if (!(request.user as any).isAdmin) {
      return reply.code(403).send({
        status: false,
        message: "You don't have access to restore products",
      });
    }

    await prisma.product.update({
      where: { id },
      data: { isDeleted: false },
    });

    reply.code(200).send({
      status: true,
      message: "Restored Successfully!",
    });
  } catch (err) {
    console.error({ err });
    reply.code(500).send({
      status: false,
      data: err,
    });
  }
};

export const getDailyDeals = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const dailyDeals = await prisma.product.findMany({
      where: {
        isDailyDeals: true,
        isDeleted: false,
      },
    });

    reply.code(200).send({
      status: true,
      data: dailyDeals,
    });
  } catch (err) {
    reply.code(500).send({
      status: false,
      data: err,
    });
  }
};

export const toggleDailyDeal = async (
  request: FastifyRequest<{ Params: { id: string }; Body: { isDailyDeals: boolean } }>,
  reply: FastifyReply,
) => {
  const { id } = request.params;
  const { isDailyDeals } = request.body;

  try {
    if (!(request.user as any).isAdmin) {
      return reply.code(403).send({
        status: false,
        message: "You don't have access to update daily deals",
      });
    }

    await prisma.product.update({
      where: { id },
      data: { isDailyDeals },
    });

    reply.code(200).send({
      status: true,
      message: isDailyDeals ? "Added to Daily Deals" : "Removed from Daily Deals",
    });
  } catch (err) {
    reply.code(500).send({
      status: false,
      data: err,
    });
  }
};
