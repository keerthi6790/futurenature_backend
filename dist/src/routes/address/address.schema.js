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
exports.$ref = exports.addressSchema = void 0;
const fastify_zod_1 = require("fastify-zod");
const z = __importStar(require("zod"));
const AddAddressRequestSchema = z.object({
    receiverName: z.string().optional(),
    label: z.string().default("Home"),
    address1: z.string({
        required_error: "Address 1 is mandatory",
    }),
    address2: z.string({
        required_error: "Address 1 is mandatory",
    }),
    address3: z.string({
        required_error: "Address 1 is mandatory",
    }),
    address4: z
        .string({
        required_error: "Address 1 is mandatory",
    })
        .optional(),
    pincode: z.string().regex(/^[1-9][0-9]{5}$/, {
        message: "Invalid Indian PIN code. Must be a 6-digit number starting from 1-9.",
    }),
    district: z.string({
        required_error: "District is required",
    }),
    city: z.string({
        required_error: "City is Required",
    }),
    state: z.string({
        required_error: "State is Required",
    }),
    mobileNumber: z
        .string({
        required_error: "Mobile Number is Required",
    })
        .min(10, { message: "Mobile number must be at least 10 digits long." })
        .max(10, { message: "Mobile number cannot exceed 10 digits." })
        .regex(/^\+?[1-9]\d{1,10}$/, { message: "Invalid mobile number format." }),
});
const EditAddressRequestSchema = z.object({
    receiverName: z.string().optional(),
    label: z.string().optional(),
    address1: z
        .string({
        required_error: "Address 1 is mandatory",
    })
        .optional(),
    address2: z
        .string({
        required_error: "Address 1 is mandatory",
    })
        .optional(),
    address3: z
        .string({
        required_error: "Address 1 is mandatory",
    })
        .optional(),
    address4: z
        .string({
        required_error: "Address 1 is mandatory",
    })
        .optional(),
    pincode: z
        .string()
        .regex(/^[1-9][0-9]{5}$/, {
        message: "Invalid Indian PIN code. Must be a 6-digit number starting from 1-9.",
    })
        .optional(),
    district: z
        .string({
        required_error: "District is required",
    })
        .optional(),
    city: z
        .string({
        required_error: "City is Required",
    })
        .optional(),
    state: z
        .string({
        required_error: "State is Required",
    })
        .optional(),
    mobileNumber: z
        .string({
        required_error: "Mobile Number is Required",
    })
        .min(10, { message: "Mobile number must be at least 10 digits long." })
        .max(10, { message: "Mobile number cannot exceed 10 digits." })
        .regex(/^\+?[1-9]\d{1,10}$/, { message: "Invalid mobile number format." })
        .optional(),
});
_a = (0, fastify_zod_1.buildJsonSchemas)({
    AddAddressRequestSchema,
    EditAddressRequestSchema,
}, { $id: "addressSchema" }), exports.addressSchema = _a.schemas, exports.$ref = _a.$ref;
