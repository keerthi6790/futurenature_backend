import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../../utils/prisma";

export const toggleWishlist = async (
    request: FastifyRequest<{ Params: { productId: string } }>,
    reply: FastifyReply
) => {
    try {
        const userId = request.user.id;
        const { productId } = request.params;

        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return reply.code(404).send({
                status: false,
                message: "Product not found",
            });
        }

        // Check if already in wishlist
        const existingWishlist = await prisma.wishlist.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
        });

        if (existingWishlist) {
            // Remove from wishlist
            await prisma.wishlist.delete({
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
        } else {
            // Add to wishlist
            await prisma.wishlist.create({
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
    } catch (err) {
        return reply.code(500).send({
            status: false,
            message: "Internal server error",
            data: err,
        });
    }
};

export const getWishlist = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const userId = request.user.id;

        const wishlist = await prisma.wishlist.findMany({
            where: { userId },
            include: {
                product: {
                    include: {
                        variants: true,
                    },
                },
            },
        });

        return reply.code(200).send({
            status: true,
            data: wishlist.map((item) => item.product),
        });
    } catch (err) {
        return reply.code(500).send({
            status: false,
            message: "Internal server error",
            data: err,
        });
    }
};
