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
exports.AddressRoutes = AddressRoutes;
const address_schema_1 = require("./address.schema");
const address_controller_1 = require("./address.controller");
function AddressRoutes(app) {
    return __awaiter(this, void 0, void 0, function* () {
        app.post("/add", {
            schema: {
                body: (0, address_schema_1.$ref)("AddAddressRequestSchema"),
                tags: ["Address"],
                summary: "Add a new address",
                description: "Creates a new address for the authenticated user using `prisma.address.create`.",
            },
            preHandler: [app.authenticate],
        }, address_controller_1.addAddress);
        app.get("/alladdress", {
            preHandler: [app.authenticate],
            schema: {
                tags: ["Address"],
                summary: "Get all addresses for the user",
                description: "Fetches all addresses associated with the authenticated user using `prisma.address.findMany`.",
            },
        }, address_controller_1.GetAllUserAddress);
        app.delete("/delete/:id", {
            preHandler: [app.authenticate],
            schema: {
                params: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                    },
                },
                tags: ["Address"],
                summary: "Delete an address",
                description: "Deletes a specific address using `prisma.address.delete`. Requires authentication.",
            },
        }, address_controller_1.deleteAddress);
        app.put("/edit/:id", {
            preHandler: [app.authenticate],
            schema: {
                body: (0, address_schema_1.$ref)("EditAddressRequestSchema"),
                params: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                    },
                },
                tags: ["Address"],
                summary: "Edit an address",
                description: "Updates an existing address using `prisma.address.update`. Requires authentication.",
            },
        }, address_controller_1.editAddress);
    });
}
