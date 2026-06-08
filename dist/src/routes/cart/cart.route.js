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
exports.CartRoutes = void 0;
const cart_controller_1 = require("./cart.controller");
const cart_schema_1 = require("./cart.schema");
const CartRoutes = (app) => __awaiter(void 0, void 0, void 0, function* () {
    app.post("/add", {
        preHandler: [app.authenticate],
        schema: {
            body: (0, cart_schema_1.$ref)("AddCartRequestSchema"),
            tags: ["Cart"],
            summary: "Add products to cart",
            description: "Adds products to the user's cart. Involves `prisma.cart.upsert` and `prisma.cartItem.upsert`.",
        },
    }, cart_controller_1.addProductsToCart);
    app.get("/all", {
        preHandler: [app.authenticate],
        schema: {
            tags: ["Cart"],
            summary: "Get all cart items",
            description: "Fetches all items in the user's cart using `prisma.cart.findUnique` with `include`.",
        },
    }, cart_controller_1.getAllCartItem);
    app.delete("/delete", {
        preHandler: [app.authenticate],
        schema: {
            body: (0, cart_schema_1.$ref)("DeleteCartRequestSchema"),
            tags: ["Cart"],
            summary: "Delete an item from cart",
            description: "Removes an item from the user's cart using `prisma.cartItem.delete`.",
        },
    }, cart_controller_1.deleteCartItem);
    app.put("/update-quantity", {
        preHandler: [app.authenticate],
        schema: {
            body: (0, cart_schema_1.$ref)("UpdateCartQuantityRequestSchema"),
            tags: ["Cart"],
            summary: "Update item quantity in cart",
            description: "Updates the quantity of an item in the user's cart and recalculates totals.",
        },
    }, cart_controller_1.updateCartItemQuantity);
    app.put("/update-address", {
        preHandler: [app.authenticate],
        schema: {
            body: (0, cart_schema_1.$ref)("UpdateAddressToCart"),
            tags: ["Cart"],
            summary: "Update item quantity in cart",
            description: "Updates the quantity of an item in the user's cart and recalculates totals.",
        },
    }, cart_controller_1.updateAddressToCart);
});
exports.CartRoutes = CartRoutes;
