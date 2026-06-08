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
exports.toggleDailyDeal = exports.getDailyDeals = exports.RestoreProduct = exports.DeleteProduct = exports.UpdateProduct = exports.getSpecificProductData = exports.listAllProducts = exports.AddProducts = void 0;
const Prisma_1 = __importDefault(require("../../utils/Prisma"));
const s3_utils_1 = require("../../utils/s3.utils");
const AddProducts = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const { description, imageUrl, price, productName, descriptionTamil, discountedAmount, discountedType, productNameTamil, availableQuantity, } = request.body;
    try {
        if (!request.user.isAdmin) {
            reply.code(500).send({
                status: false,
                data: "You don't have an access to add the product",
            });
        }
        let sellingPrice = 0;
        if (discountedType === "percentage") {
            sellingPrice = Math.round(+price - +price * (+discountedAmount / 100));
        }
        if (discountedType === "mrp") {
            sellingPrice = Math.round(+price - +discountedAmount);
        }
        const processedImageUrls = yield Promise.all(imageUrl.map((img, index) => __awaiter(void 0, void 0, void 0, function* () {
            if (img.startsWith("data:image/") || img.length > 500) {
                return yield (0, s3_utils_1.uploadToS3)(img, `${productName}-${index}.jpg`);
            }
            return img;
        })));
        const data = yield Prisma_1.default.product.create({
            data: {
                product_name: productName,
                description: description,
                price: price,
                imageUrl: processedImageUrls,
                description_tamil: descriptionTamil,
                discounted_amount: discountedAmount,
                discounted_type: discountedType,
                product_name_tamil: productNameTamil,
                selling_price: String(sellingPrice),
                available_quantity: availableQuantity ? +availableQuantity : 5,
            },
        });
        reply.code(200).send({
            status: true,
            message: "Added Successfully!",
        });
    }
    catch (err) {
        reply.code(500).send({
            status: false,
            data: err,
        });
        console.log({ err });
    }
});
exports.AddProducts = AddProducts;
const listAllProducts = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const { includeDeleted } = request.query;
    try {
        const productData = yield Prisma_1.default.product.findMany({
            where: includeDeleted === "true" ? {} : {
                isDeleted: false,
            },
            select: {
                id: true,
                product_name: true,
                product_name_tamil: true,
                selling_price: true,
                price: true,
                discounted_amount: true,
                imageUrl: true,
                discounted_type: true,
                description: true,
                description_tamil: true,
                overall_rating: true,
                review_count: true,
                isDailyDeals: true,
                available_quantity: true
            },
        });
        reply.code(200).send({
            status: true,
            data: productData,
        });
    }
    catch (err) {
        reply.code(500).send({
            status: false,
            data: err,
        });
    }
});
exports.listAllProducts = listAllProducts;
const getSpecificProductData = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productInfo = yield Prisma_1.default.product.findFirst({
            where: {
                id: request.params.id,
            },
            include: {
                reviews: {
                    select: {
                        rating: true,
                        review: true,
                        addedBy: {
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
        });
        if (productInfo) {
            reply.code(200).send({
                status: true,
                data: productInfo,
            });
        }
        else {
            reply.code(500).send({
                status: true,
                message: "Product id is invalid",
            });
        }
    }
    catch (err) {
        reply.code(500).send({
            status: false,
            data: err,
        });
    }
});
exports.getSpecificProductData = getSpecificProductData;
const UpdateProduct = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = request.params;
    const { description, imageUrl, price, productName, descriptionTamil, discountedAmount, discountedType, productNameTamil, availableQuantity, } = request.body;
    try {
        if (!request.user.isAdmin) {
            return reply.code(403).send({
                status: false,
                message: "You don't have access to update products",
            });
        }
        const existingProduct = yield Prisma_1.default.product.findUnique({
            where: { id },
        });
        if (!existingProduct) {
            return reply.code(404).send({
                status: false,
                message: "Product not found",
            });
        }
        let sellingPrice = parseFloat(existingProduct.selling_price);
        // If base fields are provided, update them
        const updateData = {};
        if (productName)
            updateData.product_name = productName;
        if (productNameTamil)
            updateData.product_name_tamil = productNameTamil;
        if (description)
            updateData.description = description;
        if (descriptionTamil)
            updateData.description_tamil = descriptionTamil;
        if (availableQuantity)
            updateData.available_quantity = +availableQuantity;
        if (price || discountedAmount || discountedType) {
            const finalPrice = price || existingProduct.price;
            const finalDiscountType = discountedType || existingProduct.discounted_type;
            const finalDiscountAmount = discountedAmount || existingProduct.discounted_amount;
            if (finalDiscountType === "percentage") {
                sellingPrice = Math.round(+finalPrice - +finalPrice * (+finalDiscountAmount / 100));
            }
            else if (finalDiscountType === "mrp") {
                sellingPrice = Math.round(+finalPrice - +finalDiscountAmount);
            }
            updateData.price = finalPrice;
            updateData.discounted_type = finalDiscountType;
            updateData.discounted_amount = finalDiscountAmount;
            updateData.selling_price = String(sellingPrice);
        }
        if (imageUrl) {
            updateData.imageUrl = yield Promise.all(imageUrl.map((img, index) => __awaiter(void 0, void 0, void 0, function* () {
                if (img.startsWith("data:image/") || img.length > 500) {
                    return yield (0, s3_utils_1.uploadToS3)(img, `${productName || existingProduct.product_name}-${index}.jpg`);
                }
                return img;
            })));
        }
        const updatedProduct = yield Prisma_1.default.product.update({
            where: { id },
            data: updateData,
        });
        reply.code(200).send({
            status: true,
            message: "Updated Successfully!",
            data: updatedProduct,
        });
    }
    catch (err) {
        console.error({ err });
        reply.code(500).send({
            status: false,
            data: err,
        });
    }
});
exports.UpdateProduct = UpdateProduct;
const DeleteProduct = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = request.params;
    console.log({ id });
    try {
        if (!request.user.isAdmin) {
            return reply.code(403).send({
                status: false,
                message: "You don't have access to delete products",
            });
        }
        // Soft delete the product
        yield Prisma_1.default.product.update({
            where: { id },
            data: { isDeleted: true },
        });
        reply.code(200).send({
            status: true,
            message: "Deleted Successfully!",
        });
    }
    catch (err) {
        console.error({ err });
        reply.code(500).send({
            status: false,
            data: err,
        });
    }
});
exports.DeleteProduct = DeleteProduct;
const RestoreProduct = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = request.params;
    try {
        if (!request.user.isAdmin) {
            return reply.code(403).send({
                status: false,
                message: "You don't have access to restore products",
            });
        }
        yield Prisma_1.default.product.update({
            where: { id },
            data: { isDeleted: false },
        });
        reply.code(200).send({
            status: true,
            message: "Restored Successfully!",
        });
    }
    catch (err) {
        console.error({ err });
        reply.code(500).send({
            status: false,
            data: err,
        });
    }
});
exports.RestoreProduct = RestoreProduct;
const getDailyDeals = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dailyDeals = yield Prisma_1.default.product.findMany({
            where: {
                isDailyDeals: true,
                isDeleted: false,
            },
        });
        reply.code(200).send({
            status: true,
            data: dailyDeals,
        });
    }
    catch (err) {
        reply.code(500).send({
            status: false,
            data: err,
        });
    }
});
exports.getDailyDeals = getDailyDeals;
const toggleDailyDeal = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = request.params;
    const { isDailyDeals } = request.body;
    try {
        if (!request.user.isAdmin) {
            return reply.code(403).send({
                status: false,
                message: "You don't have access to update daily deals",
            });
        }
        yield Prisma_1.default.product.update({
            where: { id },
            data: { isDailyDeals },
        });
        reply.code(200).send({
            status: true,
            message: isDailyDeals ? "Added to Daily Deals" : "Removed from Daily Deals",
        });
    }
    catch (err) {
        reply.code(500).send({
            status: false,
            data: err,
        });
    }
});
exports.toggleDailyDeal = toggleDailyDeal;
