import { FastifyReply, FastifyRequest } from "fastify";
import { ZodAddProductsRequestSchme } from "./product.schema";
import prisma from "../../utils/Prisma";

export const AddProducts = async (
  request: FastifyRequest<{ Body: ZodAddProductsRequestSchme }>,
  reply: FastifyReply
) => {
  const {
    description,
    imageUrl,
    price,
    productName,
    variants,
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
      sellingPrice = +price - +price * (+discountedAmount / 100);
    }
    if (discountedType === "mrp") {
      sellingPrice = +price - +discountedAmount;
    }

    const data = await prisma.product.create({
      data: {
        product_name: productName,
        description: description,
        price: price,
        imageUrl: imageUrl,
        description_tamil: descriptionTamil,
        discounted_amount: discountedAmount,
        discounted_type: discountedType,
        product_name_tamil: productNameTamil,
        selling_price: String(sellingPrice),
        available_quantity: availableQuantity ? +availableQuantity : 5,
      },
    });

    const productAttribute = variants.map((variant) => {
      let sellingPrice: number = 0;
      if (variant.discountedType === "percentage") {
        sellingPrice =
          +variant.price - +variant.price * (+variant.discountedAmount / 100);
      }
      if (variant.discountedType === "mrp") {
        sellingPrice = +variant.price - +variant.discountedAmount;
      }
      return {
        attribute_name: variant.attributeName,
        price: variant.price,
        title: variant.title,
        attributeId: data.id,
        discounted_amount: variant.discountedAmount,
        discounted_type: variant.discountedType,
        selling_price: String(sellingPrice),
        available_quantity: variant.availableQuantity
          ? +variant.availableQuantity
          : 5,
      };
    });

    await prisma.attributeProduct.createMany({
      data: productAttribute,
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
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const productData = await prisma.product.findMany({
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
        variants: true,
        overall_rating: true,
        review_count: true,
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
  reply: FastifyReply
) => {
  try {
    const productInfo = await prisma.product.findFirst({
      where: {
        id: request.params.id,
      },
      include: {
        variants: true,
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
  reply: FastifyReply
) => {
  const { id } = request.params;
  const {
    description,
    imageUrl,
    price,
    productName,
    variants,
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
    if (imageUrl) updateData.imageUrl = imageUrl;
    if (availableQuantity) updateData.available_quantity = +availableQuantity;

    if (price || discountedAmount || discountedType) {
      const finalPrice = price || existingProduct.price;
      const finalDiscountType = discountedType || existingProduct.discounted_type;
      const finalDiscountAmount = discountedAmount || existingProduct.discounted_amount;

      if (finalDiscountType === "percentage") {
        sellingPrice = +finalPrice - +finalPrice * (+finalDiscountAmount / 100);
      } else if (finalDiscountType === "mrp") {
        sellingPrice = +finalPrice - +finalDiscountAmount;
      }

      updateData.price = finalPrice;
      updateData.discounted_type = finalDiscountType;
      updateData.discounted_amount = finalDiscountAmount;
      updateData.selling_price = String(sellingPrice);
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    // Handle variants update by replacing them if provided
    if (variants) {
      await prisma.attributeProduct.deleteMany({
        where: { attributeId: id },
      });

      const productAttributes = variants.map((variant) => {
        let variantSellingPrice = 0;
        if (variant.discountedType === "percentage") {
          variantSellingPrice =
            +(variant.price || 0) -
            +(variant.price || 0) * (+(variant.discountedAmount || 0) / 100);
        } else if (variant.discountedType === "mrp") {
          variantSellingPrice =
            +(variant.price || 0) - +(variant.discountedAmount || 0);
        }

        return {
          attribute_name: variant.attributeName || "",
          price: variant.price || "0",
          title: variant.title || "",
          attributeId: id,
          discounted_amount: variant.discountedAmount || "0",
          discounted_type: variant.discountedType || "mrp",
          selling_price: String(variantSellingPrice),
          available_quantity: variant.availableQuantity
            ? +variant.availableQuantity
            : 5,
        };
      });

      if (productAttributes.length > 0) {
        await prisma.attributeProduct.createMany({
          data: productAttributes,
        });
      }
    }

    reply.code(200).send({
      status: true,
      message: "Updated Successfully!",
      data: updatedProduct,
    });
  } catch (err) {
    console.error(err);
    reply.code(500).send({
      status: false,
      data: err,
    });
  }
};

export const DeleteProduct = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const { id } = request.params;

  try {
    if (!(request.user as any).isAdmin) {
      return reply.code(403).send({
        status: false,
        message: "You don't have access to delete products",
      });
    }

    // Delete variants first due to foreign key constraints if not set to cascade
    await prisma.attributeProduct.deleteMany({
      where: { attributeId: id },
    });

    // Delete the product
    await prisma.product.delete({
      where: { id },
    });

    reply.code(200).send({
      status: true,
      message: "Deleted Successfully!",
    });
  } catch (err) {
    console.error(err);
    reply.code(500).send({
      status: false,
      data: err,
    });
  }
};
