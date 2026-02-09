import { FastifyReply, FastifyRequest } from "fastify";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

import prisma from "../../utils/Prisma";

export const createOrder = async (
    request: FastifyRequest<{ Body: { cartId: string; currency: string; addressId: string } }>,
    reply: FastifyReply
) => {
    try {
        const { cartId, currency, addressId } = request.body;
        const userId = (request.user as any).id;

        if (!cartId || !addressId) {
            return reply.code(400).send({
                status: false,
                message: "Cart ID and Address ID are required",
            });
        }

        const cart = await prisma.cart.findUnique({
            where: { id: cartId },
            include: { cart_item: true }
        });

        if (!cart || cart.cart_item.length === 0) {
            return reply.code(404).send({
                status: false,
                message: "Cart is empty or not found",
            });
        }

        const amount = Number(cart.total_price);

        // 1. Create Razorpay Order
        const options = {
            amount: amount * 100,
            currency: currency || "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const razorpayOrder = await razorpay.orders.create(options);

        // 2. Create Pending Order in our Database
        const order = await prisma.order.create({
            data: {
                userId,
                addressId,
                total_price: cart.total_price,
                discounted_price: cart.discounted_price,
                mrp_price: cart.mrp_price,
                paymentStatus: "PENDING",
                razorpayOrderId: razorpayOrder.id,
                items: {
                    create: cart.cart_item.map((item) => ({
                        productId: item.productId,
                        selected_quantity: item.selected_quantity,
                        total_price: item.total_price,
                        discounted_price: item.discounted_price,
                        mrp_price: item.mrp_price,
                    })),
                },
            },
        });

        reply.code(200).send({
            status: true,
            data: razorpayOrder,
            orderId: order.id
        });
    } catch (error) {
        console.error("Error creating order:", error);
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
        const userId = (request.user as any).id;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Update Order status
            const order = await prisma.order.updateMany({
                where: { razorpayOrderId: razorpay_order_id, userId },
                data: {
                    paymentStatus: "PAID",
                    paymentId: razorpay_payment_id,
                }
            });

            // Clear Cart
            await prisma.cartItem.deleteMany({
                where: { cart: { userId } }
            });

            await prisma.cart.update({
                where: { userId },
                data: {
                    total_price: "0",
                    discounted_price: "0",
                    mrp_price: "0"
                }
            });

            reply.code(200).send({
                status: true,
                message: "Payment verified successfully",
            });
        } else {
            // Optional: Mark order as FAILED
            await prisma.order.updateMany({
                where: { razorpayOrderId: razorpay_order_id, userId },
                data: { paymentStatus: "FAILED" }
            });

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
