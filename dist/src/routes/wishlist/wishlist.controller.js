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
exports.getWishlist = exports.toggleWishlist = void 0;
const Prisma_1 = __importDefault(require("../../utils/Prisma"));
const toggleWishlist = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = request.user.id;
        const { productId } = request.params;
        // Check if product exists
        const product = yield Prisma_1.default.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            return reply.code(404).send({
                status: false,
                message: "Product not found",
            });
        }
        // Check if already in wishlist
        const existingWishlist = yield Prisma_1.default.wishlist.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
        });
        if (existingWishlist) {
            // Remove from wishlist
            yield Prisma_1.default.wishlist.delete({
                where: {
                    userId_productId: {
                        userId,
                        productId,
                    },
                },
            });
            return reply.code(200).send({
                status: true,
                message: "Removed from wishlist",
                action: "removed",
            });
        }
        else {
            // Add to wishlist
            yield Prisma_1.default.wishlist.create({
                data: {
                    userId,
                    productId,
                },
            });
            return reply.code(201).send({
                status: true,
                message: "Added to wishlist",
                action: "added",
            });
        }
    }
    catch (err) {
        return reply.code(500).send({
            status: false,
            message: "Internal server error",
            data: err,
        });
    }
});
exports.toggleWishlist = toggleWishlist;
const getWishlist = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = request.user.id;
        const wishlist = yield Prisma_1.default.wishlist.findMany({
            where: { userId },
            include: {
                product: true,
            },
        });
        return reply.code(200).send({
            status: true,
            data: wishlist.map((item) => item.product),
        });
    }
    catch (err) {
        return reply.code(500).send({
            status: false,
            message: "Internal server error",
            data: err,
        });
    }
});
exports.getWishlist = getWishlist;
