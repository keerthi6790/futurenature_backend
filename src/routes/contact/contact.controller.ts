import { FastifyReply, FastifyRequest } from 'fastify';
import { ContactRequest, ContactResponse } from './contact.schema';
import { emailService } from '../../utils/emailService';

export async function submitContactFormHandler(
    request: FastifyRequest<{
        Body: ContactRequest;
    }>,
    reply: FastifyReply
) {
    try {
        const contactData = request.body;

        // Send email to admin
        await emailService.sendContactFormEmail(contactData);

        const response: ContactResponse = {
            success: true,
            message: 'Your message has been sent successfully. We will get back to you soon!',
        };

        return reply.code(200).send(response);
    } catch (error) {
        console.error('Error processing contact form:', error);

        const response: ContactResponse = {
            success: false,
            message: 'Failed to send your message. Please try again later or contact us directly.',
        };

        return reply.code(500).send(response);
    }
}
