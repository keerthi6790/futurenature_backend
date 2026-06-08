"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.$ref = exports.reviewSchema = exports.AddReviewSchema = void 0;
const fastify_zod_1 = require("fastify-zod");
const zod_1 = __importDefault(require("zod"));
exports.AddReviewSchema = zod_1.default.object({
    message: zod_1.default.string({
        required_error: "Message is required",
    }),
    rating: zod_1.default
        .number({
        required_error: "Rating is Required",
    })
        .min(1, { message: "Minimum 1" })
        .max(5, { message: "Maximum is 5" }),
});
_a = (0, fastify_zod_1.buildJsonSchemas)({ AddReviewSchema: exports.AddReviewSchema }, { $id: "reviewSchema" }), exports.reviewSchema = _a.schemas, exports.$ref = _a.$ref;
