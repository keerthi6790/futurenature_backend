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
exports.editConstants = exports.getConstants = void 0;
const Prisma_1 = __importDefault(require("../../utils/Prisma"));
const getConstants = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield Prisma_1.default.constants.findMany();
        if (data) {
            reply.code(201).send({
                status: true,
                data,
            });
        }
    }
    catch (err) {
        reply.code(500).send({
            status: false,
            message: "Something went wrong!",
            data: err,
        });
    }
});
exports.getConstants = getConstants;
const editConstants = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { deliveryChargeOutsideTamilNadu, deliveryChargeTamilNadu, freeDelivery, } = request.body;
        if (freeDelivery) {
            yield Prisma_1.default.constants.update({
                where: {
                    id: "1",
                },
                data: {
                    boolean: String(freeDelivery),
                },
            });
        }
        if (deliveryChargeTamilNadu) {
            yield Prisma_1.default.constants.update({
                where: {
                    id: "2",
                },
                data: {
                    boolean: String(deliveryChargeTamilNadu),
                },
            });
        }
        if (deliveryChargeOutsideTamilNadu) {
            yield Prisma_1.default.constants.update({
                where: {
                    id: "3",
                },
                data: {
                    boolean: String(deliveryChargeOutsideTamilNadu),
                },
            });
        }
        reply.code(200).send({
            status: true,
            message: "Edited Successfully",
        });
    }
    catch (err) {
        reply.code(500).send({
            data: err,
            status: false,
            message: "Something went wrong",
        });
    }
});
exports.editConstants = editConstants;
