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
exports.appendComments = exports.appendOrderToSheet = void 0;
const googleapis_1 = require("googleapis");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const appendOrderToSheet = (orderData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const SERVICE_ACCOUNT_FILE = path_1.default.join(__dirname, "credentials.json");
        const credentials = JSON.parse(fs_1.default.readFileSync(SERVICE_ACCOUNT_FILE, "utf8"));
        const auth = new googleapis_1.google.auth.GoogleAuth({
            credentials,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });
        const sheets = googleapis_1.google.sheets({ version: "v4", auth });
        console.log({ sheets });
        const values = [
            [
                orderData.orderId,
                orderData.customerName,
                orderData.customerEmail,
                orderData.totalAmount,
                orderData.items,
                orderData.address,
                orderData.transactionId,
                orderData.timestamp,
            ],
        ];
        const response = yield sheets.spreadsheets.values.append({
            spreadsheetId: "17WJe0ZKbJwA4CwHAvlFUHkI_RbngAOXI5sjXCns6IAQ",
            range: "Sheet1!A:H", // Assumes logging to Sheet1
            valueInputOption: "RAW",
            requestBody: {
                values,
            },
        });
        const whatsappResponse = yield fetch(`https://int.chatway.in/api/send-msg?username=${process.env.WHATSAPP_USERNAME}&number=${process.env.WHATSAPP_NUMBER}&message=customerName->${orderData.customerName}, customerEmail-> ${orderData.customerEmail}, totalAmount-> ${orderData.totalAmount}, items-> ${orderData.items}, address-> ${orderData.address}&token=${process.env.WHATSAPP_TOKEN}`, {
            method: "GET",
        });
        console.log({ whatsappResponse });
        console.log("Order logged to Google Sheets:", response.data);
    }
    catch (error) {
        console.error("Error logging order to Google Sheets:", error);
        // We don't throw here to avoid failing the payment verification if sheet logging fails
    }
});
exports.appendOrderToSheet = appendOrderToSheet;
const appendComments = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const SERVICE_ACCOUNT_FILE = path_1.default.join(__dirname, "credentials.json");
        const credentials = JSON.parse(fs_1.default.readFileSync(SERVICE_ACCOUNT_FILE, "utf8"));
        const auth = new googleapis_1.google.auth.GoogleAuth({
            credentials,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });
        const sheets = googleapis_1.google.sheets({ version: "v4", auth });
        console.log({ sheets });
        const values = [[data.name, data.email, data.mobile, data.message]];
        const response = yield sheets.spreadsheets.values.append({
            spreadsheetId: "1wmx6JxySOdEoiyA5DqtOk0s_9o73GBTZfPredTPlfhk",
            range: "Sheet1!A:D", // Assumes logging to Sheet1
            valueInputOption: "RAW",
            requestBody: {
                values,
            },
        });
        console.log("Order logged to Google Sheets:", response.data);
        return response;
    }
    catch (error) {
        console.error("Error logging order to Google Sheets:", error);
        // We don't throw here to avoid failing the payment verification if sheet logging fails
    }
});
exports.appendComments = appendComments;
