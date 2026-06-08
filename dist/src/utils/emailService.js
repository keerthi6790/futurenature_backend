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
exports.sendSimpleMessage = sendSimpleMessage;
const form_data_1 = __importDefault(require("form-data")); // form-data v4.0.1
const mailgun_js_1 = __importDefault(require("mailgun.js")); // mailgun.js v11.1.0
function sendSimpleMessage() {
    return __awaiter(this, void 0, void 0, function* () {
        const mailgun = new mailgun_js_1.default(form_data_1.default);
        const mg = mailgun.client({
            username: "api",
            key: process.env.API_KEY || "API_KEY",
            // When you have an EU-domain, you must specify the endpoint:
            // url: "https://api.eu.mailgun.net"
        });
        try {
            const data = yield mg.messages.create("enhanceassets.netlify.app", {
                from: "Mailgun Sandbox <postmaster@enhanceassets.netlify.app>",
                to: ["Keerthivasan <balakeerthi2710@gmail.com>"],
                subject: "Hello Keerthivasan",
                template: "Order Confirmation",
                "h:X-Mailgun-Variables": JSON.stringify({
                    test: "test",
                }),
            });
            console.log(data); // logs response data
        }
        catch (error) {
            console.log(error); // logs any error
        }
    });
}
