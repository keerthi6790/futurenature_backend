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
exports.submitContactFormHandler = submitContactFormHandler;
const googleSheets_1 = require("../../utils/googleSheets");
function submitContactFormHandler(request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { name, email, mobile, message } = request.body;
            const res = yield (0, googleSheets_1.appendComments)({ name, email, mobile, message });
            if ((res === null || res === void 0 ? void 0 : res.status) === 200) {
                const response = {
                    success: true,
                    message: "Your message has been sent successfully. We will get back to you soon!",
                };
                return reply.code(200).send(response);
            }
            else {
                const response = {
                    success: false,
                    message: "Failed to send your message. Please try again later or contact us directly.",
                };
                return reply.code(500).send(response);
            }
        }
        catch (error) {
            console.error("Error processing contact form:", error);
            const response = {
                success: false,
                message: "Failed to send your message. Please try again later or contact us directly.",
            };
            return reply.code(500).send(response);
        }
    });
}
