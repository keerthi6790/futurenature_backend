import { FastifyReply, FastifyRequest } from "fastify";
import { ZodAddReviewSchema } from "./review.schema";
import prisma from "../../utils/Prisma";

const updateProductRating = async (productId: string) => {
  const reviews = await prisma.review.findMany({
    where: { reviewId: productId },
    select: { rating: true },
  });

  const reviewCount = reviews.length;
  const overallRating =
    reviewCount > 0
      ? reviews.reduce((acc, curr) => acc + Number(curr.rating), 0) /
      reviewCount
      : 0;

  await prisma.product.update({
    where: { id: productId },
    data: {
      overall_rating: overallRating,
      review_count: reviewCount,
    },
  });
};

export const postAReview = async (
  request: FastifyRequest<{
    Body: ZodAddReviewSchema;
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply
) => {
  try {
    const { message, rating } = request.body;

    const reviewData = await prisma.review.create({
      data: {
        rating: rating,
        review: message,
        reviewId: request.params.id,
        addedById: (request.user as any).id,
      },
    });

    await updateProductRating(request.params.id);

    console.log({ reviewData });

    reply.code(200).send({
      status: true,
      data: reviewData,
      message: "Added Successfully",
    });
  } catch (err: any) {
    if (err.code === 'P2002') {
      reply.code(500).send({
        status: false,
        data: { msg: "Already you have posted a review" },
      });
    }
    reply.code(500).send({
      status: false,
      data: err,
    });
  }
};

export const updateAReview = async (
  request: FastifyRequest<{ Body: ZodAddReviewSchema; Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const { message, rating } = request.body;

    const reviewData = await prisma.review.update({
      where: {
        id: request.params.id,
        addedById: (request.user as any).id,
      },
      data: {
        rating: rating,
        review: message,
      },
    });

    await updateProductRating(reviewData.reviewId);

    reply.code(200).send({
      status: true,
      data: reviewData,
      message: "Updated Successfully",
    });
  } catch (err) {
    reply.code(500).send({
      status: false,
      data: err,
      message: "Either Review Id/ User Id are mismatched",
    });
  }
};

export const deleteAReview = async (
  request: FastifyRequest<{ Params: { reviewId: string } }>,
  reply: FastifyReply
) => {
  try {
    const { reviewId } = request.params;
    console.log({ reviewId, userId: request?.user?.id });
    const reviewData = await prisma.review.delete({
      where: {
        id: reviewId,
        addedById: (request.user as any).id,
      },
    });

    await updateProductRating(reviewData.reviewId);

    reply.code(200).send({
      status: true,
      data: reviewData,
      message: "Deleted Successfully",
    });
  } catch (err) {
    console.log({ err });
    reply.code(500).send({
      status: false,
      data: err,
    });
  }
};

export const listReviewsByProductId = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        reviewId: request.params.id,
      },
      include: {
        addedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    reply.code(200).send({
      status: true,
      data: reviews,
    });
  } catch (err) {
    reply.code(500).send({
      status: false,
      data: err,
    });
  }
};
