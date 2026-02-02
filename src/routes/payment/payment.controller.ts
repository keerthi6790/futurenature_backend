import { FastifyReply, FastifyRequest } from "fastify";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

import prisma from "../../utils/Prisma";

export const createOrder = async (
    request: FastifyRequest<{ Body: { cartId: string; currency: string } }>,
    reply: FastifyReply
) => {
    try {
        const { cartId, currency } = request.body;

        if (!cartId) {
            return reply.code(400).send({
                status: false,
                message: "Cart ID is required",
            });
        }

        const cart = await prisma.cart.findUnique({
            where: { id: cartId }
        });

        if (!cart) {
            return reply.code(404).send({
                status: false,
                message: "Cart not found",
            });
        }

        // Assuming total_price is stored as string in DB, convert to number
        // Razorpay anticipates amount in smallest currency unit (paise for INR)
        const amount = Number(cart.total_price);

        const options = {
            amount: amount * 100, // amount in smallest currency unit
            currency: currency || "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        reply.code(200).send({
            status: true,
            data: order,
        });
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        reply.code(500).send({
            status: false,
            message: "Something went wrong creating order",
            error,
        });
    }
};

export const verifyPayment = async (
    request: FastifyRequest<{ Body: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string } }>,
    reply: FastifyReply
) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = request.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Database update logic here (e.g., create Order, clear Cart)
            // For now, just return success

            reply.code(200).send({
                status: true,
                message: "Payment verified successfully",
            });
        } else {
            reply.code(400).send({
                status: false,
                message: "Invalid signature",
            });
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        reply.code(500).send({
            status: false,
            message: "Something went wrong verifying payment",
            error,
        });
    }
};
