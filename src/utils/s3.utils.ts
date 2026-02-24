import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const s3Client = new S3Client({
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
export const uploadToS3 = async (
    fileData: string | Buffer,
    fileName: string,
    contentType: string = "image/jpeg"
): Promise<string> => {
    let body: Buffer;

    if (typeof fileData === "string") {
        // If it's a base64 data URI, strip the prefix
        const base64Content = fileData.split(";base64,").pop() || fileData;
        body = Buffer.from(base64Content, "base64");
    } else {
        body = fileData;
    }

    const key = `products/${Date.now()}-${fileName}`;
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: body,
        ContentType: contentType,
    });

    try {
        await s3Client.send(command);
        // Construct the public URL (Make sure the bucket has public access or use a CDN URL)
        return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    } catch (error) {
        console.error("S3 Upload Error:", error);
        throw new Error("Failed to upload image to S3");
    }
};
