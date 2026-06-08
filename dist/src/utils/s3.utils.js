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
exports.uploadToS3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION || "",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});
const bucketName = process.env.AWS_S3_BUCKET_NAME || "";
/**
 * Uploads a base64 image or buffer to S3
 * @param fileData Base64 string or Buffer
 * @param fileName Desired filename in S3
 * @param contentType MIME type of the file
 * @returns The public URL of the uploaded file
 */
const uploadToS3 = (fileData_1, fileName_1, ...args_1) => __awaiter(void 0, [fileData_1, fileName_1, ...args_1], void 0, function* (fileData, fileName, contentType = "image/jpeg") {
    let body;
    if (typeof fileData === "string") {
        // If it's a base64 data URI, strip the prefix
        const base64Content = fileData.split(";base64,").pop() || fileData;
        body = Buffer.from(base64Content, "base64");
    }
    else {
        body = fileData;
    }
    const key = `products/${Date.now()}-${fileName}`;
    const command = new client_s3_1.PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: body,
        ContentType: contentType,
    });
    try {
        yield s3Client.send(command);
        // Construct the public URL (Make sure the bucket has public access or use a CDN URL)
        return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    }
    catch (error) {
        console.error("S3 Upload Error:", error);
        throw new Error("Failed to upload image to S3");
    }
});
exports.uploadToS3 = uploadToS3;
