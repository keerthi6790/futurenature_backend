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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listReviewsByProductId = exports.deleteAReview = exports.updateAReview = exports.postAReview = void 0;
const Prisma_1 = __importDefault(require("../../utils/Prisma"));
const updateProductRating = (productId) => __awaiter(void 0, void 0, void 0, function* () {
    const reviews = yield Prisma_1.default.review.findMany({
        where: { reviewId: productId },
        select: { rating: true },
    });
    const reviewCount = reviews.length;
    const overallRating = reviewCount > 0
        ? reviews.reduce((acc, curr) => acc + Number(curr.rating), 0) /
            reviewCount
        : 0;
    yield Prisma_1.default.product.update({
        where: { id: productId },
        data: {
            overall_rating: overallRating,
            review_count: reviewCount,
        },
    });
});
const postAReview = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { message, rating } = request.body;
        console.log({ message, rating, user: request.user.id });
        const reviewData = yield Prisma_1.default.review.create({
            data: {
                rating: rating,
                review: message,
                reviewId: request.params.id,
                addedById: request.user.id,
            },
        });
        yield updateProductRating(request.params.id);
        reply.code(200).send({
            status: true,
            data: reviewData,
            message: "Added Successfully",
        });
    }
    catch (err) {
        console.log({ err });
        if (err.code === "P2002") {
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
});
exports.postAReview = postAReview;
const updateAReview = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { message, rating } = request.body;
        const reviewData = yield Prisma_1.default.review.update({
            where: {
                id: request.params.id,
                addedById: request.user.id,
            },
            data: {
                rating: rating,
                review: message,
            },
        });
        yield updateProductRating(reviewData.reviewId);
        reply.code(200).send({
            status: true,
            data: reviewData,
            message: "Updated Successfully",
        });
    }
    catch (err) {
        reply.code(500).send({
            status: false,
            data: err,
            message: "Either Review Id/ User Id are mismatched",
        });
    }
});
exports.updateAReview = updateAReview;
const deleteAReview = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { reviewId } = request.params;
        console.log({ reviewId, userId: (_a = request === null || request === void 0 ? void 0 : request.user) === null || _a === void 0 ? void 0 : _a.id });
        const reviewData = yield Prisma_1.default.review.delete({
            where: {
                id: reviewId,
                addedById: request.user.id,
            },
        });
        yield updateProductRating(reviewData.reviewId);
        reply.code(200).send({
            status: true,
            data: reviewData,
            message: "Deleted Successfully",
        });
    }
    catch (err) {
        console.log({ err });
        reply.code(500).send({
            status: false,
            data: err,
        });
    }
});
exports.deleteAReview = deleteAReview;
const listReviewsByProductId = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reviews = yield Prisma_1.default.review.findMany({
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
    }
    catch (err) {
        reply.code(500).send({
            status: false,
            data: err,
        });
    }
});
exports.listReviewsByProductId = listReviewsByProductId;
