"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.$ref = exports.productSchemas = void 0;
const fastify_zod_1 = require("fastify-zod");
const zod_1 = __importDefault(require("zod"));
const AddProductsRequestSchme = zod_1.default.object({
    productName: zod_1.default.string({
        required_error: "Product Name is Required",
    }),
    productNameTamil: zod_1.default.string({
        required_error: "Product Name in tamil is Required",
    }),
    descriptionTamil: zod_1.default.string({
        required_error: "Description in tamil is Required",
    }),
    description: zod_1.default.string({
        required_error: "Description is Required",
    }),
    discountedType: zod_1.default.enum(["percentage", "mrp"], {
        required_error: "Discounted type is required",
        invalid_type_error: "Discounted value only accept two values, percentage or mrp",
    }),
    discountedAmount: zod_1.default.string({
        required_error: "Discounted amount is required",
    }),
    price: zod_1.default.string({
        required_error: "Price is Required",
    }),
    imageUrl: zod_1.default.array(zod_1.default.string({
        required_error: "Image url is Required",
    })),
    availableQuantity: zod_1.default
        .string({
        required_error: "Available Quantity is Required",
    })
        .optional(),
});
const UpdateProductsRequestSchme = AddProductsRequestSchme.partial();
_a = (0, fastify_zod_1.buildJsonSchemas)({
    AddProductsRequestSchme,
    UpdateProductsRequestSchme,
}, { $id: "productSchemas" }), exports.productSchemas = _a.schemas, exports.$ref = _a.$ref;
