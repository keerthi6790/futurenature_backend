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
exports.getUserData = exports.RegisterUser = exports.verifyOtp = exports.triggerOtp = void 0;
const Prisma_1 = __importDefault(require("../../utils/Prisma"));
const GenerateOtp_1 = require("../../utils/GenerateOtp");
const client_1 = require("@prisma/client");
const otpService_1 = require("../../utils/otpService");
const triggerOtp = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const { mobileNumber } = request.body;
    try {
        const generatedOtp = (0, GenerateOtp_1.GenerateSixDigitOtp)();
        const response = yield (0, otpService_1.OtpSender)(`91${mobileNumber}`, generatedOtp);
        console.log({ response });
        yield Prisma_1.default.otp.upsert({
            where: {
                phone_number: mobileNumber,
            },
            update: {
                otp: String(generatedOtp),
            },
            create: {
                phone_number: mobileNumber,
                otp: String(generatedOtp),
            },
        });
        if ((response === null || response === void 0 ? void 0 : response.data.ErrorMessage) == "Done") {
            reply.code(201).send({
                status: true,
                message: `Otp is sent to your ${mobileNumber}`,
            });
        }
        else {
            reply.code(500).send({
                status: false,
                message: "OTP is not sent",
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
exports.triggerOtp = triggerOtp;
const verifyOtp = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { mobileNumber, otp } = request.body;
        const dbData = yield Prisma_1.default.otp.findUnique({
            where: {
                phone_number: mobileNumber,
            },
        });
        if (!dbData) {
            reply.code(500).send({
                status: false,
                message: "Your mobile no is not matched in a db!",
            });
        }
        if ((dbData === null || dbData === void 0 ? void 0 : dbData.otp) === otp) {
            const userData = yield Prisma_1.default.user.findUnique({
                where: {
                    phone_number: mobileNumber,
                },
            });
            yield Prisma_1.default.otp.delete({
                where: {
                    phone_number: mobileNumber,
                },
            });
            if (userData) {
                const payload = {
                    id: userData.id,
                    isAdmin: userData.isAdmin,
                };
                const token = request.jwt.sign(payload);
                reply.code(201).send({
                    status: true,
                    message: "Otp verified!",
                    data: {
                        code: "EXISTING_CUSTOMER",
                        token,
                    },
                });
            }
            else {
                // New Customer Flow: Do not create user yet.
                // Do not send token.
                reply.code(201).send({
                    status: true,
                    message: "Otp verified!",
                    data: {
                        code: "NEW_CUSTOMER",
                    },
                });
            }
        }
        else {
            reply.code(201).send({
                status: false,
                message: "Otp mismatched!",
            });
        }
    }
    catch (err) {
        console.log({ err });
        reply.code(500).send({
            status: false,
            data: err,
        });
    }
});
exports.verifyOtp = verifyOtp;
const RegisterUser = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, lastName, mobileNumber, email, dob, isWhatsappOptIn } = request.body;
        // Create new user directly
        const user = yield Prisma_1.default.user.create({
            data: {
                firstName,
                lastName,
                email,
                dob: new Date(dob),
                isWhatsappOptIn,
                phone_number: mobileNumber,
                is_verified: true,
            },
        });
        const payload = {
            id: user.id,
            isAdmin: user.isAdmin,
        };
        const token = request.jwt.sign(payload);
        reply.code(201).send({
            status: true,
            message: "User Registered Successfully",
            data: {
                token,
            },
        });
    }
    catch (err) {
        if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2025") {
                reply.code(500).send({
                    status: false,
                    message: "First Verify the Otp or the user id is not match with DB!",
                });
            }
            // The .code property can be accessed in a type-safe manner
            if (err.code === "P2002") {
                reply.code(500).send({
                    status: false,
                    message: "Mobile Number is already registered",
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
exports.RegisterUser = RegisterUser;
const getUserData = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = request.user.id;
        const user = yield Prisma_1.default.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!user) {
            reply.code(500).send({
                status: false,
                message: "User Id not found",
            });
        }
        reply.code(200).send({
            status: true,
            message: "User Data Fetched Successfully",
            data: {
                user,
            },
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
exports.getUserData = getUserData;
