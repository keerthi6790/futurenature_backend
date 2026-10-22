import { FastifyInstance } from "fastify";
import {
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from "./order.controller";

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
    getMyOrders,
  );

  app.get(
    "/admin/all",
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ["Order"],
        summary: "Get all user orders for admin",
      },
    },
    getAllOrders,
  );

  app.put(
    "/admin/status/:id",
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ["Order"],
        summary: "Update order status for admin",
      },
    },
    updateOrderStatus,
  );

  app.put(
    "/:id/status",
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ["Order"],
        summary: "Update order status",
      },
    },
    updateOrderStatus,
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
            id: { type: "string" },
          },
        },
      },
    },
    getOrderById,
  );
};
