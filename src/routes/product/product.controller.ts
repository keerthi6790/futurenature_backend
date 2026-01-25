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
