import fastify, { FastifyReply, FastifyRequest } from "fastify";
import fjwt, { FastifyJWT } from "fastify-jwt";
import { UserRoutes } from "./routes/user/user.routes";
import { userSchemas } from "./routes/user/user.schema";
import { productSchemas } from "./routes/product/product.schema";
import { ProductRoutes } from "./routes/product/product.routes";
import { ReviewRoutes } from "./routes/review/review.route";
import { reviewSchema } from "./routes/review/review.schema";
import { AddressRoutes } from "./routes/address/address.route";
import { addressSchema } from "./routes/address/address.schema";
import { CartRoutes } from "./routes/cart/cart.route";
import { cartSchema } from "./routes/cart/cart.schema";
import wishlistRoutes from "./routes/wishlist/wishlist.route";
import contactRoutes from "./routes/contact/contact.route";
import { contactSchemas } from "./routes/contact/contact.schema";
import { PaymentRoutes } from "./routes/payment/payment.route";
import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";

import { withRefResolver } from "fastify-zod";

const server = fastify();

require("dotenv").config();

if (process.env.JWT_SECRET_KEY)
  server.register(fjwt, { secret: process.env.JWT_SECRET_KEY });

server.register(fastifySwagger, {
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

server.register(fastifySwaggerUi, {
  routePrefix: "/documentation",
});

server.addHook("preHandler", (req, _, next) => {
  // here we are
  req.jwt = server.jwt;
  return next();
});

server.decorate(
  "authenticate",
  async (req: FastifyRequest, reply: FastifyReply) => {
    const token = req?.headers["authorization"]?.split(" ")[1];
    console.log({ token });
    if (!token) {
      return reply.status(401).send({ message: "Login First" });
    }
    // here decoded will be a different type by default but we want it to be of user-payload type
    const decoded = req.jwt.verify<FastifyJWT["user"]>(token);

    req.user = decoded;
  }
);

server.register(fastifyCors, {
  origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "https://enhanceassets.netlify.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
});

server.get("/", (request, reply) => {
  reply.code(200).send("Running Up..");
});

for (let schema of [
  ...userSchemas,
  ...productSchemas,
  ...reviewSchema,
  ...addressSchema,
  ...cartSchema,
  ...contactSchemas,
]) {
  server.addSchema(schema);
}

server.register(UserRoutes, { prefix: "api/user" });
server.register(ProductRoutes, { prefix: "api/product" });
server.register(ReviewRoutes, { prefix: "api/review" });
server.register(AddressRoutes, { prefix: "api/address" });
server.register(CartRoutes, { prefix: "api/cart" });
server.register(wishlistRoutes, { prefix: "api/wishlist" });
server.register(contactRoutes, { prefix: "api/contact" });
server.register(PaymentRoutes, { prefix: "api/payment" });

server
  .listen({ port: 8081 })
  .then(() => console.log(`Process running on http://localhost:8081`))
  .catch((err) => {
    console.log({ err });
  });
