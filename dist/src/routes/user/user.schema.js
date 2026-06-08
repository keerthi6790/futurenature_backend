"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.$ref = exports.userSchemas = exports.CreateUserResponseSchema = exports.CreateUserRequestSchema = exports.VerityOtpRequestSchema = exports.ResponseSchema = exports.TriggerOtpRequestSchema = void 0;
const fastify_zod_1 = require("fastify-zod");
const zod_1 = __importDefault(require("zod"));
exports.TriggerOtpRequestSchema = zod_1.default.object({
    mobileNumber: zod_1.default
        .string()
        .regex(/^[6-9]\d{9}$/, { message: "Invalid mobile number. Must be a 10-digit Indian number starting with 6-9." }),
});
exports.ResponseSchema = zod_1.default.object({
    status: zod_1.default.boolean({
        required_error: "Status is Required",
        invalid_type_error: "Status must be boolean",
    }),
    message: zod_1.default.string({
        required_error: "Message is Required",
    }),
});
exports.VerityOtpRequestSchema = zod_1.default.object({
    mobileNumber: zod_1.default
        .string({
        required_error: "Mobile Number is Required",
    })
        .regex(/^[6-9]\d{9}$/, { message: "Invalid mobile number. Must be a 10-digit Indian number starting with 6-9." }),
    otp: zod_1.default.string({
        required_error: "Otp is Required",
    }),
});
exports.CreateUserRequestSchema = zod_1.default.object({
    firstName: zod_1.default.string({
        required_error: "First Name is Required",
    }),
    lastName: zod_1.default.string({
        required_error: "Last Name is Required",
    }),
    email: zod_1.default.string({
        required_error: "Email is Required",
    }).email({ message: "Invalid email address" }),
    dob: zod_1.default.string({
        required_error: "Date of Birth is Required",
    }),
    isWhatsappOptIn: zod_1.default.boolean().default(false),
    mobileNumber: zod_1.default
        .string()
        .regex(/^[6-9]\d{9}$/, { message: "Invalid mobile number. Must be a 10-digit Indian number starting with 6-9." }),
});
exports.CreateUserResponseSchema = zod_1.default.object({
    status: zod_1.default.boolean(),
    message: zod_1.default.string({
        required_error: "Message is required",
    }),
    data: zod_1.default.object({
        token: zod_1.default.string(),
    }).optional(),
});
_a = (0, fastify_zod_1.buildJsonSchemas)({
    TriggerOtpRequestSchema: exports.TriggerOtpRequestSchema,
    ResponseSchema: exports.ResponseSchema,
    VerityOtpRequestSchema: exports.VerityOtpRequestSchema,
    CreateUserRequestSchema: exports.CreateUserRequestSchema,
    CreateUserResponseSchema: exports.CreateUserResponseSchema,
}, { $id: "userSchemas" }), exports.userSchemas = _a.schemas, exports.$ref = _a.$ref;
