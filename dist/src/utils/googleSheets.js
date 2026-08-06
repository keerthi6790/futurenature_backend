"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const buffer_1 = require("buffer");
const googleapis_1 = require("googleapis");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const node_fetch_1 = __importStar(require("node-fetch"));
const globalCompat = globalThis;
if (typeof globalCompat.fetch === "undefined") {
    globalCompat.fetch = node_fetch_1.default;
}
if (typeof globalCompat.Headers === "undefined") {
    globalCompat.Headers = node_fetch_1.Headers;
}
if (typeof globalCompat.Request === "undefined") {
    globalCompat.Request = node_fetch_1.Request;
}
if (typeof globalCompat.Response === "undefined") {
    globalCompat.Response = node_fetch_1.Response;
}
if (typeof globalCompat.Blob === "undefined") {
    globalCompat.Blob = buffer_1.Blob;
}
if (typeof globalCompat.FormData === "undefined") {
    try {
        globalCompat.FormData = require("undici").FormData;
    }
    catch (_a) {
        globalCompat.FormData = undefined;
    }
}
if (typeof globalCompat.ReadableStream === "undefined") {
    try {
        globalCompat.ReadableStream = require("stream/web").ReadableStream;
    }
    catch (_b) {
        globalCompat.ReadableStream = undefined;
    }
}
const appendOrderToSheet = (orderData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const credentials = {
            type: process.env.TYPE,
            project_id: process.env.PROJECT_ID,
            private_key_id: process.env.PRIVATE_KEY_ID,
            private_key: process.env.PRIVATE_KEY,
            client_email: process.env.CLIENT_EMAIL,
            client_id: process.env.CLIENT_ID,
            auth_uri: process.env.AUTH_URI,
            token_uri: process.env.TOKEN_URI,
            auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
            client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
            universe_domain: process.env.UNIVERSE_DOMAIN,
        };
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
        const whatsappResponse = yield (0, node_fetch_1.default)(`https://int.chatway.in/api/send-msg?username=${process.env.WHATSAPP_USERNAME}&number=${process.env.WHATSAPP_NUMBER}&message=customerName->${orderData.customerName}, customerEmail-> ${orderData.customerEmail}, totalAmount-> ${orderData.totalAmount}, items-> ${orderData.items}, address-> ${orderData.address}&token=${process.env.WHATSAPP_TOKEN}`, {
            method: "GET",
        });
        console.log({ whatsappResponse });
        console.log("Order logged to Google Sheets:", response);
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
