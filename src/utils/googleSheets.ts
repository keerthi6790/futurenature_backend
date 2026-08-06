import { Blob as NodeBlob } from "buffer";
import { google } from "googleapis";
import fs from "fs";
import path from "path";
import fetch, {
  Headers as NodeHeaders,
  Request as NodeRequest,
  Response as NodeResponse,
} from "node-fetch";

const globalCompat = globalThis as typeof globalThis & {
  Blob?: any;
  FormData?: any;
  Headers?: any;
  ReadableStream?: any;
  Request?: any;
  Response?: any;
  fetch?: any;
};

if (typeof globalCompat.fetch === "undefined") {
  globalCompat.fetch = fetch as any;
}

if (typeof globalCompat.Headers === "undefined") {
  globalCompat.Headers = NodeHeaders as any;
}

if (typeof globalCompat.Request === "undefined") {
  globalCompat.Request = NodeRequest as any;
}

if (typeof globalCompat.Response === "undefined") {
  globalCompat.Response = NodeResponse as any;
}

if (typeof globalCompat.Blob === "undefined") {
  globalCompat.Blob = NodeBlob as any;
}

if (typeof globalCompat.FormData === "undefined") {
  try {
    globalCompat.FormData = require("undici").FormData;
  } catch {
    globalCompat.FormData = undefined;
  }
}

if (typeof globalCompat.ReadableStream === "undefined") {
  try {
    globalCompat.ReadableStream = require("stream/web").ReadableStream;
  } catch {
    globalCompat.ReadableStream = undefined;
  }
}

export const appendOrderToSheet = async (orderData: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: string;
  items: string;
  address: string;
  transactionId: string;
  timestamp: string;
}) => {
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
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

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

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: "17WJe0ZKbJwA4CwHAvlFUHkI_RbngAOXI5sjXCns6IAQ",
      range: "Sheet1!A:H", // Assumes logging to Sheet1
      valueInputOption: "RAW",
      requestBody: {
        values,
      },
    });

    const whatsappResponse = await fetch(
      `https://int.chatway.in/api/send-msg?username=${process.env.WHATSAPP_USERNAME}&number=${process.env.WHATSAPP_NUMBER}&message=customerName->${orderData.customerName}, customerEmail-> ${orderData.customerEmail}, totalAmount-> ${orderData.totalAmount}, items-> ${orderData.items}, address-> ${orderData.address}&token=${process.env.WHATSAPP_TOKEN}`,
      {
        method: "GET",
      },
    );

    console.log({ whatsappResponse });

    console.log("Order logged to Google Sheets:", response);
  } catch (error) {
    console.error("Error logging order to Google Sheets:", error);
    // We don't throw here to avoid failing the payment verification if sheet logging fails
  }
};

export const appendComments = async (data: {
  name: string;
  email: string;
  message: string;
  mobile: string;
}) => {
  try {
    const SERVICE_ACCOUNT_FILE = path.join(__dirname, "credentials.json");
    const credentials = JSON.parse(
      fs.readFileSync(SERVICE_ACCOUNT_FILE, "utf8"),
    );
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    console.log({ sheets });

    const values = [[data.name, data.email, data.mobile, data.message]];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: "1wmx6JxySOdEoiyA5DqtOk0s_9o73GBTZfPredTPlfhk",
      range: "Sheet1!A:D", // Assumes logging to Sheet1
      valueInputOption: "RAW",
      requestBody: {
        values,
      },
    });

    console.log("Order logged to Google Sheets:", response.data);

    return response;
  } catch (error) {
    console.error("Error logging order to Google Sheets:", error);
    // We don't throw here to avoid failing the payment verification if sheet logging fails
  }
};
