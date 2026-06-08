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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderRoutes = void 0;
const order_controller_1 = require("./order.controller");
const OrderRoutes = (app) => __awaiter(void 0, void 0, void 0, function* () {
    app.get("/all", {
        preHandler: [app.authenticate],
        schema: {
            tags: ["Order"],
            summary: "Get all user orders",
        },
    }, order_controller_1.getMyOrders);
    app.get("/:id", {
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
    }, order_controller_1.getOrderById);
});
exports.OrderRoutes = OrderRoutes;
