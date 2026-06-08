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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAddress = exports.GetAllUserAddress = exports.editAddress = exports.addAddress = void 0;
const Prisma_1 = __importDefault(require("../../utils/Prisma"));
const client_1 = require("@prisma/client");
const addAddress = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { receiverName, label, address1, address2, address3, address4, city, district, mobileNumber, pincode, state, } = request.body;
        const addressData = yield Prisma_1.default.address.create({
            data: {
                receiverName,
                label,
                address1,
                address2,
                address3,
                address4,
                city,
                district,
                pincode,
                state,
                userId: request.user.id,
                phone_number: mobileNumber,
            },
        });
        const { phone_number } = addressData, rest = __rest(addressData, ["phone_number"]);
        reply.code(200).send({
            status: true,
            message: "Address Added Successfully",
            data: Object.assign(Object.assign({}, rest), { mobileNumber: phone_number }),
        });
    }
    catch (err) {
        reply.code(500).send({
            status: false,
            data: err,
            message: "Error",
        });
    }
});
exports.addAddress = addAddress;
const editAddress = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { receiverName, label, address1, address2, address3, address4, city, district, mobileNumber, pincode, state, } = request.body;
        const editedAddressData = yield Prisma_1.default.address.update({
            where: {
                id: request.params.id,
                userId: request.user.id,
            },
            data: {
                receiverName,
                label,
                address1,
                address2,
                address3,
                address4,
                city,
                district,
                pincode,
                state,
                phone_number: mobileNumber,
            },
        });
        const { phone_number } = editedAddressData, rest = __rest(editedAddressData, ["phone_number"]);
        reply.code(200).send({
            status: true,
            data: Object.assign(Object.assign({}, rest), { mobileNumber: phone_number }),
            message: "Edited Successfully",
        });
    }
    catch (err) {
        if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2025") {
                reply.code(500).send({
                    status: false,
                    message: "Either userId or addressId is mismatched",
                });
            }
        }
        reply.code(500).send({
            status: false,
            data: err,
            message: "Error",
        });
    }
});
exports.editAddress = editAddress;
const GetAllUserAddress = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const addressData = yield Prisma_1.default.address.findMany({
            where: {
                userId: request.user.id,
                isDeleted: false,
            },
        });
        const mappedAddressData = addressData.map((addr) => {
            const { phone_number } = addr, rest = __rest(addr, ["phone_number"]);
            return Object.assign(Object.assign({}, rest), { mobileNumber: phone_number });
        });
        reply.code(200).send({
            status: true,
            data: mappedAddressData,
            message: "All Address fetched Successfully.",
        });
    }
    catch (err) {
        reply.code(500).send({
            status: false,
            data: err,
            message: "Error",
        });
    }
});
exports.GetAllUserAddress = GetAllUserAddress;
const deleteAddress = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Prisma_1.default.address.update({
            where: {
                id: request.params.id,
                userId: request.user.id,
            },
            data: {
                isDeleted: true,
            },
        });
        reply.code(200).send({
            status: true,
            message: "Deleted Successfully.",
        });
    }
    catch (err) {
        reply.code(500).send({
            status: false,
            data: err,
            message: "Something went wrong",
        });
    }
});
exports.deleteAddress = deleteAddress;
