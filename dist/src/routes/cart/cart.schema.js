"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.$ref = exports.cartSchema = void 0;
const fastify_zod_1 = require("fastify-zod");
const z = __importStar(require("zod"));
const AddCartRequestSchema = z.object({
    productId: z.string({
        required_error: "Product Id is mandatory",
    }),
    cartId: z.string().optional(),
});
const DeleteCartRequestSchema = z.object({
    cartItemId: z.string({
        required_error: "Cart Item Id is mandatory",
    }),
    cartId: z.string({
        required_error: "Cart Id is mandatory",
    }),
});
const UpdateCartQuantityRequestSchema = z.object({
    cartItemId: z.string({
        required_error: "Cart Item Id is mandatory",
    }),
    quantity: z.number({
        required_error: "Quantity is mandatory",
    }),
    cartId: z.string({
        required_error: "Cart Id is mandatory",
    }),
});
const UpdateAddressToCart = z.object({
    cartId: z.string({
        required_error: "Cart Id is mandatory",
    }),
    addressId: z.string({
        required_error: "Cart Id is mandatory",
    }),
});
_a = (0, fastify_zod_1.buildJsonSchemas)({
    AddCartRequestSchema,
    DeleteCartRequestSchema,
    UpdateCartQuantityRequestSchema,
    UpdateAddressToCart,
}, { $id: "cartSchema" }), exports.cartSchema = _a.schemas, exports.$ref = _a.$ref;
