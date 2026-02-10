import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../../utils/Prisma";
import { ZodAddBannerRequest, ZodUpdateBannerRequest } from "./banner.schema";

export const AddBanner = async (
    request: FastifyRequest<{ Body: ZodAddBannerRequest }>,
    reply: FastifyReply,
) => {
    const { imageUrl, isActive } = request.body;

    try {
        if (!(request.user as any).isAdmin) {
            return reply.code(403).send({
                status: false,
                message: "You don't have access to add banners",
            });
        }

        const banner = await prisma.banner.create({
            data: {
                imageUrl,
                isActive,
            },
        });

        reply.code(201).send({
            status: true,
            message: "Banner added successfully!",
            data: banner,
        });
    } catch (err) {
        console.error({ err });
        reply.code(500).send({
            status: false,
            message: "Internal server error",
            error: err,
        });
    }
};

export const ListBanners = async (
    request: FastifyRequest<{ Querystring: { activeOnly?: string } }>,
    reply: FastifyReply,
) => {
    const { activeOnly } = request.query;
    try {
        const banners = await prisma.banner.findMany({
            where: activeOnly === "true" ? { isActive: true } : {},
            orderBy: { createdAt: "desc" },
        });

        reply.code(200).send({
            status: true,
            data: banners,
        });
    } catch (err) {
        console.error({ err });
        reply.code(500).send({
            status: false,
            message: "Internal server error",
            error: err,
        });
    }
};

export const EditBanner = async (
    request: FastifyRequest<{
        Params: { id: string };
        Body: ZodUpdateBannerRequest;
    }>,
    reply: FastifyReply,
) => {
    const { id } = request.params;
    const { imageUrl, isActive } = request.body;

    try {
        if (!(request.user as any).isAdmin) {
            return reply.code(403).send({
                status: false,
                message: "You don't have access to edit banners",
            });
        }

        const banner = await prisma.banner.update({
            where: { id },
            data: {
                ...(imageUrl && { imageUrl }),
                ...(isActive !== undefined && { isActive }),
            },
        });

        reply.code(200).send({
            status: true,
            message: "Banner updated successfully!",
            data: banner,
        });
    } catch (err) {
        console.error({ err });
        reply.code(500).send({
            status: false,
            message: "Internal server error",
            error: err,
        });
    }
};

export const DeleteBanner = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) => {
    const { id } = request.params;

    try {
        if (!(request.user as any).isAdmin) {
            return reply.code(403).send({
                status: false,
                message: "You don't have access to delete banners",
            });
        }

        await prisma.banner.delete({
            where: { id },
        });

        reply.code(200).send({
            status: true,
            message: "Banner deleted successfully!",
        });
    } catch (err) {
        console.error({ err });
        reply.code(500).send({
            status: false,
            message: "Internal server error",
            error: err,
        });
    }
};
