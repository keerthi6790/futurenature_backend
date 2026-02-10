import { FastifyInstance } from "fastify";
import {
    AddBanner,
    ListBanners,
    EditBanner,
    DeleteBanner,
} from "./banner.controller";
import { $ref } from "./banner.schema";

const BannerRoutes = async (server: FastifyInstance) => {
    server.get("/", {
        schema: {
            querystring: {
                type: "object",
                properties: {
                    activeOnly: { type: "string" },
                },
            },
        },
    }, ListBanners);

    server.post(
        "/",
        {
            preHandler: [server.authenticate],
            schema: {
                body: $ref("addBannerSchema"),
                response: {
                    201: {
                        type: "object",
                        properties: {
                            status: { type: "boolean" },
                            message: { type: "string" },
                            data: $ref("bannerResponseSchema"),
                        },
                    },
                },
            },
        },
        AddBanner,
    );

    server.put(
        "/:id",
        {
            preHandler: [server.authenticate],
            schema: {
                body: $ref("updateBannerSchema"),
                response: {
                    200: {
                        type: "object",
                        properties: {
                            status: { type: "boolean" },
                            message: { type: "string" },
                            data: $ref("bannerResponseSchema"),
                        },
                    },
                },
            },
        },
        EditBanner,
    );

    server.delete(
        "/:id",
        {
            preHandler: [server.authenticate],
        },
        DeleteBanner,
    );
};

export default BannerRoutes;
