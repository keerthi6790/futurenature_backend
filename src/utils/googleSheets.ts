import { google } from "googleapis";
import fs from 'fs';
import path from 'path';


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
        const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'credentials.json');
        const credentials = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE, 'utf8'));
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: "v4", auth });


        console.log({ sheets })

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
            spreadsheetId: '17WJe0ZKbJwA4CwHAvlFUHkI_RbngAOXI5sjXCns6IAQ',
            range: "Sheet1!A:H", // Assumes logging to Sheet1
            valueInputOption: "RAW",
            requestBody: {
                values,
            },
        });

        console.log("Order logged to Google Sheets:", response.data);
    } catch (error) {
        console.error("Error logging order to Google Sheets:", error);
        // We don't throw here to avoid failing the payment verification if sheet logging fails
    }
};
