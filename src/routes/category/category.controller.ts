import { FastifyReply, FastifyRequest } from "fastify";
import {
  ZodAddCategoryRequestSchema,
  ZodUpdateCategoryRequestSchema,
  ZodAssignProductsRequestSchema,
} from "./category.schema";
import prisma from "../../utils/Prisma";
import { uploadToS3 } from "../../utils/s3.utils";

export const formatCategory = (cat: any) => {
  if (!cat) return cat;
  return {
    ...cat,
    name: cat.category_name || cat.name,
    image_url: cat.category_image || cat.image_url,
    category_name: cat.category_name || cat.name,
    category_image: cat.category_image || cat.image_url,
  };
};

export const AddCategory = async (
  request: FastifyRequest<{ Body: ZodAddCategoryRequestSchema }>,
  reply: FastifyReply
) => {
  const { categoryId } = request.body;
  const categoryName = request.body.name || request.body.categoryName;
  const categoryImage = request.body.image_url || request.body.imageUrl || request.body.categoryImage;

  try {
    if (!(request.user as any)?.isAdmin) {
      return reply.code(403).send({
        status: false,
        message: "You don't have access to add categories (Admin only)",
      });
    }

    if (!categoryName) {
      return reply.code(400).send({
        status: false,
        message: "Category name is required",
      });
    }

    let processedImage = categoryImage || null;
    if (categoryImage && (categoryImage.startsWith("data:image/") || categoryImage.length > 500)) {
      processedImage = await uploadToS3(
        categoryImage,
        `category-${Date.now()}.jpg`
      );
    }

    const category = await (prisma as any).category.create({
      data: {
        category_name: categoryName,
        category_id: categoryId || undefined,
        category_image: processedImage,
      },
    });

    reply.code(200).send({
      status: true,
      message: "Category created successfully!",
      data: formatCategory(category),
    });
  } catch (err: any) {
    console.error("AddCategory error:", err);
    reply.code(500).send({
      status: false,
      message: err.message || "Failed to create category",
    });
  }
};

export const UpdateCategory = async (
  request: FastifyRequest<{
    Params: { id: string };
    Body: ZodUpdateCategoryRequestSchema;
  }>,
  reply: FastifyReply
) => {
  const { id } = request.params;
  const { categoryId } = request.body;
  const categoryName = request.body.name || request.body.categoryName;
  const categoryImage = request.body.image_url || request.body.imageUrl || request.body.categoryImage;

  try {
    if (!(request.user as any)?.isAdmin) {
      return reply.code(403).send({
        status: false,
        message: "You don't have access to update categories (Admin only)",
      });
    }

    let processedImage: string | undefined = undefined;
    if (categoryImage !== undefined) {
      if (categoryImage && (categoryImage.startsWith("data:image/") || categoryImage.length > 500)) {
        processedImage = await uploadToS3(
          categoryImage,
          `category-${Date.now()}.jpg`
        );
      } else {
        processedImage = categoryImage || undefined;
      }
    }

    const updatedCategory = await (prisma as any).category.update({
      where: { id },
      data: {
        ...(categoryName !== undefined && { category_name: categoryName }),
        ...(categoryId !== undefined && { category_id: categoryId }),
        ...(processedImage !== undefined && { category_image: processedImage }),
      },
    });

    reply.code(200).send({
      status: true,
      message: "Category updated successfully!",
      data: formatCategory(updatedCategory),
    });
  } catch (err: any) {
    console.error("UpdateCategory error:", err);
    reply.code(500).send({
      status: false,
      message: err.message || "Failed to update category",
    });
  }
};

export const DeleteCategory = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const { id } = request.params;

  try {
    if (!(request.user as any)?.isAdmin) {
      return reply.code(403).send({
        status: false,
        message: "You don't have access to delete categories (Admin only)",
      });
    }

    // Unlink products first
    await (prisma as any).product.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });

    await (prisma as any).category.delete({
      where: { id },
    });

    reply.code(200).send({
      status: true,
      message: "Category deleted successfully!",
    });
  } catch (err: any) {
    console.error("DeleteCategory error:", err);
    reply.code(500).send({
      status: false,
      message: err.message || "Failed to delete category",
    });
  }
};

export const ListCategories = async (
  _request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const categories = await (prisma as any).category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    reply.code(200).send({
      status: true,
      data: categories.map(formatCategory),
    });
  } catch (err: any) {
    console.error("ListCategories error:", err);
    reply.code(500).send({
      status: false,
      message: err.message || "Failed to list categories",
    });
  }
};

export const GetCategoryById = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const { id } = request.params;

  try {
    const category = await (prisma as any).category.findFirst({
      where: {
        OR: [{ id: id }, { category_id: id }],
      },
      include: {
        products: {
          where: { isDeleted: false },
        },
      },
    });

    if (!category) {
      return reply.code(404).send({
        status: false,
        message: "Category not found",
      });
    }

    reply.code(200).send({
      status: true,
      data: formatCategory(category),
    });
  } catch (err: any) {
    console.error("GetCategoryById error:", err);
    reply.code(500).send({
      status: false,
      message: err.message || "Failed to get category",
    });
  }
};

export const AssignProductsToCategory = async (
  request: FastifyRequest<{
    Params?: { id?: string };
    Body: ZodAssignProductsRequestSchema;
  }>,
  reply: FastifyReply
) => {
  const categoryId = request.params?.id || request.body.categoryId;
  const { productIds } = request.body;

  try {
    if (!(request.user as any)?.isAdmin) {
      return reply.code(403).send({
        status: false,
        message: "You don't have access to assign products (Admin only)",
      });
    }

    if (!categoryId) {
      return reply.code(400).send({
        status: false,
        message: "Category ID is required",
      });
    }

    const category = await (prisma as any).category.findFirst({
      where: {
        OR: [{ id: categoryId }, { category_id: categoryId }],
      },
    });

    if (!category) {
      return reply.code(404).send({
        status: false,
        message: "Category not found",
      });
    }

    if (Array.isArray(productIds) && productIds.length > 0) {
      await prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: { categoryId: category.id },
      });
    }

    reply.code(200).send({
      status: true,
      message: "Products assigned successfully to category!",
    });
  } catch (err: any) {
    console.error("AssignProductsToCategory error:", err);
    reply.code(500).send({
      status: false,
      message: err.message || "Failed to assign products to category",
    });
  }
};

