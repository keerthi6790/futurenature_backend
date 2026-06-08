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
exports.default = wishlistRoutes;
const wishlist_controller_1 = require("./wishlist.controller");
function wishlistRoutes(app) {
    return __awaiter(this, void 0, void 0, function* () {
        app.post("/toggle/:productId", {
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
        }, wishlist_controller_1.toggleWishlist);
        app.get("/", {
            preHandler: [app.authenticate],
            schema: {
                tags: ["Wishlist"],
                summary: "Get user's wishlist",
                description: "Fetches all products in the user's wishlist.",
            },
        }, wishlist_controller_1.getWishlist);
    });
}
