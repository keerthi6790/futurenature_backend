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
exports.ProductRoutes = ProductRoutes;
const product_schema_1 = require("./product.schema");
const product_controller_1 = require("./product.controller");
function ProductRoutes(app) {
    return __awaiter(this, void 0, void 0, function* () {
        app.post("/add", {
            preHandler: [app.authenticate],
            schema: {
                body: (0, product_schema_1.$ref)("AddProductsRequestSchme"),
                tags: ["Product"],
                summary: "Add a new product (Admin only)",
                description: "Creates a new product using `prisma.product.create` and its variants using `prisma.attributeProduct.createMany`. Requires admin authentication.",
            },
        }, product_controller_1.AddProducts);
        app.get("/fetchProducts", {
            schema: {
                tags: ["Product"],
                summary: "List all products",
                description: "Fetches a list of all products with selected fields using `prisma.product.findMany`.",
            },
        }, product_controller_1.listAllProducts);
        app.get("/products", {
            schema: {
                tags: ["Product"],
                summary: "List all products",
                description: "Fetches a list of all products with selected fields using `prisma.product.findMany`.",
            },
        }, product_controller_1.listAllProducts);
        app.get("/getProductInfo/:id", {
            schema: {
                params: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                    },
                },
                tags: ["Product"],
                summary: "Get specific product details",
                description: "Fetches detailed information for a specific product, including variants and reviews, using `prisma.product.findFirst` with `include`.",
            },
        }, product_controller_1.getSpecificProductData);
        app.put("/update/:id", {
            preHandler: [app.authenticate],
            schema: {
                params: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                    },
                },
                body: (0, product_schema_1.$ref)("UpdateProductsRequestSchme"),
                tags: ["Product"],
                summary: "Update an existing product (Admin only)",
                description: "Updates product details and replaces variants. Requires admin authentication.",
            },
        }, product_controller_1.UpdateProduct);
        app.delete("/delete/:id", {
            preHandler: [app.authenticate],
            schema: {
                params: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                    },
                },
                tags: ["Product"],
                summary: "Delete a product (Admin only)",
                description: "Deletes a product and its associated variants. Requires admin authentication.",
            },
        }, product_controller_1.DeleteProduct);
        app.post("/restore/:id", {
            preHandler: [app.authenticate],
            schema: {
                params: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                    },
                },
                tags: ["Product"],
                summary: "Restore a deleted product (Admin only)",
            },
        }, product_controller_1.RestoreProduct);
        app.get("/daily-deals", {
            schema: {
                tags: ["Product"],
                summary: "Get all daily deals",
            },
        }, product_controller_1.getDailyDeals);
        app.post("/toggle-daily-deal/:id", {
            preHandler: [app.authenticate],
            schema: {
                params: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                    },
                },
                body: {
                    type: "object",
                    properties: {
                        isDailyDeals: { type: "boolean" },
                    },
                },
                tags: ["Product"],
                summary: "Add/Remove product from daily deals (Admin only)",
            },
        }, product_controller_1.toggleDailyDeal);
    });
}
