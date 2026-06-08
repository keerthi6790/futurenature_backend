"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRoutes = ReviewRoutes;
const review_controller_1 = require("./review.controller");
const review_schema_1 = require("./review.schema");
function ReviewRoutes(app) {
    return __awaiter(this, void 0, void 0, function* () {
        app.post("/post/:id", {
            schema: {
                body: (0, review_schema_1.$ref)("AddReviewSchema"),
                params: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                    },
                },
                tags: ["Review"],
                summary: "Post a review for a product",
                description: "Creates a new review for a specific product using `prisma.review.create`. Requires authentication.",
            },
            preHandler: [app.authenticate],
        }, review_controller_1.postAReview);
        app.put("/update/:id", {
            schema: {
                body: (0, review_schema_1.$ref)("AddReviewSchema"),
                params: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                    },
                },
                tags: ["Review"],
                summary: "Update a review",
                description: "Updates an existing review using `prisma.review.update`. Requires authentication.",
            },
            preHandler: [app.authenticate],
        }, review_controller_1.updateAReview);
        app.delete("/delete/:reviewId", {
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
                description: "Deletes a specific review using `prisma.review.delete`. Requires authentication.",
            },
        }, review_controller_1.deleteAReview);
        app.get("/getProductReviews/:id", {
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
        }, review_controller_1.listReviewsByProductId);
    });
}
