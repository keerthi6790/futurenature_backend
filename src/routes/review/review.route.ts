import { FastifyInstance } from "fastify";
import { deleteAReview, listReviewsByProductId, postAReview, updateAReview } from "./review.controller";
import { $ref } from "./review.schema";

export async function ReviewRoutes(app: FastifyInstance) {
  app.post(
    "/post/:id",
    {
      schema: {
        body: $ref("AddReviewSchema"),
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
        tags: ["Review"],
        summary: "Post a review for a product",
        description:
          "Creates a new review for a specific product using `prisma.review.create`. Requires authentication.",
      },
      preHandler: [app.authenticate],
    },
    postAReview
  );

  app.put(
    "/update/:id",
    {
      schema: {
        body: $ref("AddReviewSchema"),
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
        tags: ["Review"],
        summary: "Update a review",
        description:
          "Updates an existing review using `prisma.review.update`. Requires authentication.",
      },
      preHandler: [app.authenticate],
    },
    updateAReview
  );

  app.delete(
    "/delete/:reviewId",
    {
      preHandler: [app.authenticate],
      schema: {
        params: {
          type: "object",
          properties: {
            reviewId: { type: "string" },
          },
        },
        tags: ["Review"],
        summary: "Delete a review",
        description:
          "Deletes a specific review using `prisma.review.delete`. Requires authentication.",
      },
    },
    deleteAReview
  );

  app.get(
    "/getProductReviews/:id",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
        tags: ["Review"],
        summary: "Get all reviews for a product",
        description: "Fetches all reviews for a specific product.",
      },
    },
    listReviewsByProductId
  );
}
