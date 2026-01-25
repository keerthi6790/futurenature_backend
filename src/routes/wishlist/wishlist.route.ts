import { FastifyInstance } from "fastify";
import { getWishlist, toggleWishlist } from "./wishlist.controller";

export default async function wishlistRoutes(app: FastifyInstance) {
    app.post(
        "/toggle/:productId",
        {
            preHandler: [app.authenticate],
            schema: {
                params: {
                    type: "object",
                    properties: {
                        productId: { type: "string" },
                    },
                },
                tags: ["Wishlist"],
                summary: "Toggle wishlist status for a product",
                description: "Adds or removes a product from the user's wishlist.",
            },
        },
        toggleWishlist
    );

    app.get(
        "/",
        {
            preHandler: [app.authenticate],
            schema: {
                tags: ["Wishlist"],
                summary: "Get user's wishlist",
                description: "Fetches all products in the user's wishlist.",
            },
        },
        getWishlist
    );
}
