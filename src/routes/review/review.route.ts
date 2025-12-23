import { FastifyInstance } from "fastify";
import { deleteAReview, postAReview, updateAReview } from "./review.controller";
import { $ref } from "./review.schema";

export async function ReviewRoutes(app: FastifyInstance) {
  app.post(
    "/post/:id",
    {
      schema: {
        body: $ref("AddReviewSchema"),
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
      },
      preHandler: [app.authenticate],
    },
    updateAReview
  );

  app.delete(
    "/delete/:reviewId",
    {
      preHandler: [app.authenticate],
    },
    deleteAReview
  );
}
