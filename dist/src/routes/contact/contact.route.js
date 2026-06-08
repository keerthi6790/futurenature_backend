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
Object.defineProperty(exports, "__esModule", { value: true });
const contact_controller_1 = require("./contact.controller");
const contact_schema_1 = require("./contact.schema");
function contactRoutes(server) {
    return __awaiter(this, void 0, void 0, function* () {
        server.post('/', {
            schema: {
                description: 'Submit contact form',
                tags: ['Contact'],
                body: (0, contact_schema_1.$ref)('contactRequestSchema'),
                response: {
                    200: (0, contact_schema_1.$ref)('contactResponseSchema'),
                    500: (0, contact_schema_1.$ref)('contactResponseSchema'),
                },
            },
        }, contact_controller_1.submitContactFormHandler);
    });
}
exports.default = contactRoutes;
