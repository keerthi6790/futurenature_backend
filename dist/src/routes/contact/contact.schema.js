"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.$ref = exports.contactSchemas = void 0;
const zod_1 = require("zod");
const fastify_zod_1 = require("fastify-zod");
// Indian mobile number regex: 10 digits, optional +91 prefix
const indianMobileRegex = /^(\+91)?[6-9]\d{9}$/;
const contactRequestSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, 'Name must be at least 3 characters long'),
    email: zod_1.z.string().email('Invalid email address'),
    mobile: zod_1.z.string().regex(indianMobileRegex, 'Invalid Indian mobile number. Must be 10 digits starting with 6-9'),
    message: zod_1.z.string().min(1, 'Message is required'),
});
const contactResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    message: zod_1.z.string(),
});
_a = (0, fastify_zod_1.buildJsonSchemas)({
    contactRequestSchema,
    contactResponseSchema,
}, { $id: 'contactSchemas' }), exports.contactSchemas = _a.schemas, exports.$ref = _a.$ref;
