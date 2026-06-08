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
exports.getMyOrders = exports.getOrderById = void 0;
const Prisma_1 = __importDefault(require("../../utils/Prisma"));
const getOrderById = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = request.params;
        const userId = request.user.id;
        const order = yield Prisma_1.default.order.findUnique({
            where: { id, userId },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                address: true,
            },
        });
        if (!order) {
            return reply.code(404).send({
                status: false,
                message: "Order not found",
            });
        }
        reply.code(200).send({
            status: true,
            data: Object.assign(Object.assign({}, order), { shippingPrice: order.shippingPrice }),
        });
    }
    catch (error) {
        console.error("Error fetching order:", error);
        reply.code(500).send({
            status: false,
            message: "Something went wrong fetching order",
        });
    }
});
exports.getOrderById = getOrderById;
const getMyOrders = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = request.user.id;
        const orders = yield Prisma_1.default.order.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                address: true,
            },
        });
        // Add shippingPrice to each order in response
        const ordersWithShipping = orders.map((order) => (Object.assign(Object.assign({}, order), { shippingPrice: order.shippingPrice })));
        reply.code(200).send({
            status: true,
            data: ordersWithShipping,
        });
        return;
        reply.code(200).send({
            status: true,
            data: orders,
        });
    }
    catch (error) {
        console.error("Error fetching orders:", error);
        reply.code(500).send({
            status: false,
            message: "Something went wrong fetching orders",
        });
    }
});
exports.getMyOrders = getMyOrders;
