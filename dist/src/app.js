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
require("dotenv").config();
const fastify_1 = __importDefault(require("fastify"));
const fastify_jwt_1 = __importDefault(require("fastify-jwt"));
const user_routes_1 = require("./routes/user/user.routes");
const user_schema_1 = require("./routes/user/user.schema");
const product_schema_1 = require("./routes/product/product.schema");
const product_routes_1 = require("./routes/product/product.routes");
const review_route_1 = require("./routes/review/review.route");
const review_schema_1 = require("./routes/review/review.schema");
const address_route_1 = require("./routes/address/address.route");
const address_schema_1 = require("./routes/address/address.schema");
const cart_route_1 = require("./routes/cart/cart.route");
const cart_schema_1 = require("./routes/cart/cart.schema");
const wishlist_route_1 = __importDefault(require("./routes/wishlist/wishlist.route"));
const contact_route_1 = __importDefault(require("./routes/contact/contact.route"));
const contact_schema_1 = require("./routes/contact/contact.schema");
const payment_route_1 = require("./routes/payment/payment.route");
const order_route_1 = require("./routes/order/order.route");
const cors_1 = __importDefault(require("@fastify/cors"));
const swagger_1 = __importDefault(require("@fastify/swagger"));
const swagger_ui_1 = __importDefault(require("@fastify/swagger-ui"));
const emailService_1 = require("./utils/emailService");
const constants_route_1 = require("./routes/constants/constants.route");
const server = (0, fastify_1.default)({
    bodyLimit: 5 * 1024 * 1024, // 5MB
});
require("dotenv").config();
if (process.env.JWT_SECRET_KEY)
    server.register(fastify_jwt_1.default, { secret: process.env.JWT_SECRET_KEY });
server.register(swagger_1.default, {
    openapi: {
        info: {
            title: "FutureNature API",
            description: "API documentation for FutureNature backend",
            version: "1.0.0",
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    },
});
server.register(swagger_ui_1.default, {
    routePrefix: "/documentation",
});
server.addHook("preHandler", (req, _, next) => {
    // here we are
    req.jwt = server.jwt;
    return next();
});
server.decorate("authenticate", (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req === null || req === void 0 ? void 0 : req.headers["authorization"]) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    console.log({ token });
    if (!token) {
        return reply.status(401).send({ message: "Login First" });
    }
    // here decoded will be a different type by default but we want it to be of user-payload type
    const decoded = req.jwt.verify(token);
    req.user = decoded;
}));
server.register(cors_1.default, {
    origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "https://futurenature12.netlify.app",
        "https://futurenature.in",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
});
server.get("/", (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    reply.code(200).send("Running Up..");
}));
server.get("/mail", (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, emailService_1.sendSimpleMessage)();
    reply.code(200).send("Mail sent");
}));
for (let schema of [
    ...user_schema_1.userSchemas,
    ...product_schema_1.productSchemas,
    ...review_schema_1.reviewSchema,
    ...address_schema_1.addressSchema,
    ...cart_schema_1.cartSchema,
    ...contact_schema_1.contactSchemas,
]) {
    server.addSchema(schema);
}
server.register(user_routes_1.UserRoutes, { prefix: "api/user" });
server.register(product_routes_1.ProductRoutes, { prefix: "api/product" });
server.register(review_route_1.ReviewRoutes, { prefix: "api/review" });
server.register(address_route_1.AddressRoutes, { prefix: "api/address" });
server.register(cart_route_1.CartRoutes, { prefix: "api/cart" });
server.register(wishlist_route_1.default, { prefix: "api/wishlist" });
server.register(contact_route_1.default, { prefix: "api/contact" });
server.register(constants_route_1.ConstantsRoutes, { prefix: "api/constants" });
server.register(payment_route_1.PaymentRoutes, { prefix: "api/payment" });
server.register(order_route_1.OrderRoutes, { prefix: "api/order" });
server
    .listen({ port: 8081, host: "0.0.0.0" })
    .then(() => console.log(`Process running on http://localhost:8081`))
    .catch((err) => {
    console.log({ err });
});
