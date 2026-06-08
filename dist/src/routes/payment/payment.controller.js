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
exports.verifyPayment = exports.createOrder = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});
const Prisma_1 = __importDefault(require("../../utils/Prisma"));
const googleSheets_1 = require("../../utils/googleSheets");
const createOrder = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Creating Razorpay Order...");
        const { cartId, currency, addressId } = request.body;
        const userId = request.user.id;
        if (!cartId || !addressId) {
            return reply.code(400).send({
                status: false,
                message: "Cart ID and Address ID are required",
            });
        }
        const cart = yield Prisma_1.default.cart.findUnique({
            where: { id: cartId },
            include: { cart_item: true },
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
        const razorpayOrder = yield razorpay.orders.create(options);
        console.log("Razorpay Order Created:", razorpayOrder.id);
        // 2. Create Pending Order in our Database
        const order = yield Prisma_1.default.order.create({
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
            orderId: order.id,
        });
    }
    catch (error) {
        console.error("Error creating order:", error);
        reply.code(500).send({
            status: false,
            message: "Something went wrong creating order",
            error,
        });
    }
});
exports.createOrder = createOrder;
const verifyPayment = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = request.body;
        const userId = request.user.id;
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto_1.default
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
            .update(body.toString())
            .digest("hex");
        const isAuthentic = expectedSignature === razorpay_signature;
        if (isAuthentic) {
            // Update Order status
            const order = yield Prisma_1.default.order.updateMany({
                where: { razorpayOrderId: razorpay_order_id, userId },
                data: {
                    paymentStatus: "PAID",
                    paymentId: razorpay_payment_id,
                },
            });
            // Clear Cart
            yield Prisma_1.default.cartItem.deleteMany({
                where: { cart: { userId } },
            });
            yield Prisma_1.default.cart.update({
                where: { userId },
                data: {
                    total_price: "0",
                    discounted_price: "0",
                    mrp_price: "0",
                },
            });
            // Fetch full order details for logging to Google Sheets
            try {
                const fullOrder = yield Prisma_1.default.order.findFirst({
                    where: { razorpayOrderId: razorpay_order_id, userId },
                    include: {
                        user: true,
                        items: {
                            include: {
                                product: true,
                            },
                        },
                        address: true,
                    },
                });
                if (fullOrder) {
                    const orderData = {
                        orderId: fullOrder.id,
                        customerName: `${((_a = fullOrder.user) === null || _a === void 0 ? void 0 : _a.firstName) || ""} ${((_b = fullOrder.user) === null || _b === void 0 ? void 0 : _b.lastName) || ""}`.trim() ||
                            "N/A",
                        customerEmail: ((_c = fullOrder.user) === null || _c === void 0 ? void 0 : _c.phone_number) || "N/A", // User model uses phone_number as primary identifier
                        totalAmount: fullOrder.total_price.toString(),
                        items: fullOrder.items
                            .map((item) => `${item.product.product_name} (x${item.selected_quantity})`)
                            .join(", "),
                        address: fullOrder.address
                            ? `${fullOrder.address.address1}, ${fullOrder.address.city}, ${fullOrder.address.state} - ${fullOrder.address.pincode}`
                            : "N/A",
                        transactionId: razorpay_payment_id,
                        timestamp: new Date().toLocaleString("en-IN", {
                            timeZone: "Asia/Kolkata",
                        }),
                    };
                    console.log({ orderData });
                    // Log to Google Sheets
                    yield (0, googleSheets_1.appendOrderToSheet)(orderData);
                }
            }
            catch (logError) {
                console.error("Failed to log order to Google Sheets:", logError);
            }
            reply.code(200).send({
                status: true,
                message: "Payment verified successfully",
            });
        }
        else {
            // Optional: Mark order as FAILED
            yield Prisma_1.default.order.updateMany({
                where: { razorpayOrderId: razorpay_order_id, userId },
                data: { paymentStatus: "FAILED" },
            });
            reply.code(400).send({
                status: false,
                message: "Invalid signature",
            });
        }
    }
    catch (error) {
        console.error("Error verifying payment:", error);
        reply.code(500).send({
            status: false,
            message: "Something went wrong verifying payment",
            error,
        });
    }
});
exports.verifyPayment = verifyPayment;
