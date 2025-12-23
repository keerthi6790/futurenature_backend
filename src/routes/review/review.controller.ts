import { FastifyReply, FastifyRequest } from "fastify";
import { ZodAddReviewSchema } from "./review.schema";
import prisma from "../../utils/Prisma";

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
        rating: String(rating),
        review: message,
        reviewId: request.params.id,
        addedById: request.user.id,
      },
    });

    console.log({ reviewData });

    reply.code(200).send({
      status: true,
      data: reviewData,
      message: "Added Successfully",
    });
  } catch (err) {
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
        addedById: request.user.id,
      },
      data: {
        rating: String(rating),
        review: message,
      },
    });

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
        addedById: request.user.id,
      },
    });

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
      message: "Either Review Id/ User Id are mismatched",
    });
  }
};
