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
exports.UserRoutes = UserRoutes;
const user_controller_1 = require("./user.controller");
const user_schema_1 = require("./user.schema");
function UserRoutes(app) {
    return __awaiter(this, void 0, void 0, function* () {
        app.post("/triggerOtp", {
            schema: {
                body: (0, user_schema_1.$ref)("TriggerOtpRequestSchema"),
                response: {
                    201: (0, user_schema_1.$ref)("ResponseSchema"),
                },
                tags: ["User"],
                summary: "Trigger OTP for mobile number",
                description: "Generates a 6-digit OTP and saves/updates it in the database using `prisma.otp.upsert`.",
            },
        }, user_controller_1.triggerOtp);
        app.post("/verifyOtp", {
            schema: {
                body: (0, user_schema_1.$ref)("VerityOtpRequestSchema"),
                tags: ["User"],
                summary: "Verify OTP and login/register",
                description: "Verifies the OTP against the database (`prisma.otp.findUnique`). If valid, it either finds an existing user (`prisma.user.findUnique`) or creates a new one (`prisma.user.create`). Returns a JWT token.",
            },
        }, user_controller_1.verifyOtp);
        app.post("/register", {
            schema: {
                body: (0, user_schema_1.$ref)("CreateUserRequestSchema"),
                response: {
                    201: (0, user_schema_1.$ref)("CreateUserResponseSchema"),
                },
                tags: ["User"],
                summary: "Register user details",
                description: "Updates the user's profile with first name, last name, and hashed password using `prisma.user.update`. Requires authentication.",
            },
        }, user_controller_1.RegisterUser);
        app.get("/userData", {
            preHandler: [app.authenticate],
        }, user_controller_1.getUserData);
    });
}
