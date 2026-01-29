import { FastifyInstance } from 'fastify';
import { submitContactFormHandler } from './contact.controller';
import { $ref } from './contact.schema';

async function contactRoutes(server: FastifyInstance) {
    server.post(
        '/',
        {
            schema: {
                description: 'Submit contact form',
                tags: ['Contact'],
                body: $ref('contactRequestSchema'),
                response: {
                    200: $ref('contactResponseSchema'),
                    500: $ref('contactResponseSchema'),
                },
            },
        },
        submitContactFormHandler
    );
}

export default contactRoutes;
