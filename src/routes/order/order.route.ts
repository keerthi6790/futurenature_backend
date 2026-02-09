import { FastifyInstance } from "fastify";
import { getMyOrders, getOrderById } from "./order.controller";

export const OrderRoutes = async (app: FastifyInstance) => {
    app.get(
        "/all",
        {
            preHandler: [app.authenticate],
            schema: {
                tags: ["Order"],
                summary: "Get all user orders",
            },
        },
        getMyOrders
    );

    app.get(
        "/:id",
        {
            preHandler: [app.authenticate],
            schema: {
                tags: ["Order"],
                summary: "Get order by ID",
                params: {
                    type: "object",
                    properties: {
                        id: { type: "string" }
                    }
                }
            },
        },
        getOrderById
    );
};
