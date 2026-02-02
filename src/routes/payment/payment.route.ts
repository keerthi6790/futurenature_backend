import { FastifyInstance } from "fastify";
import { createOrder, verifyPayment } from "./payment.controller";

export async function PaymentRoutes(fastify: FastifyInstance) {
    fastify.post("/create-order", {
        preHandler: [fastify.authenticate]
    }, createOrder);

    fastify.post("/verify-payment", {
        preHandler: [fastify.authenticate]
    }, verifyPayment);
}
