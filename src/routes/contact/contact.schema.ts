import { z } from 'zod';
import { buildJsonSchemas } from 'fastify-zod';

// Indian mobile number regex: 10 digits, optional +91 prefix
const indianMobileRegex = /^(\+91)?[6-9]\d{9}$/;

const contactRequestSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters long'),
    email: z.string().email('Invalid email address'),
    mobile: z.string().regex(indianMobileRegex, 'Invalid Indian mobile number. Must be 10 digits starting with 6-9'),
    message: z.string().min(1, 'Message is required'),
});

const contactResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
});

export type ContactRequest = z.infer<typeof contactRequestSchema>;
export type ContactResponse = z.infer<typeof contactResponseSchema>;

export const { schemas: contactSchemas, $ref } = buildJsonSchemas(
    {
        contactRequestSchema,
        contactResponseSchema,
    },
    { $id: 'contactSchemas' }
);
