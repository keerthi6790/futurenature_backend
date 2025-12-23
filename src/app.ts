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
const server = fastify();

require("dotenv").config();

if (process.env.JWT_SECRET_KEY)
  server.register(fjwt, { secret: process.env.JWT_SECRET_KEY });

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
      return reply.status(401).send({ message: "Authentication required" });
    }
    // here decoded will be a different type by default but we want it to be of user-payload type
    const decoded = req.jwt.verify<FastifyJWT["user"]>(token);

    req.user = decoded;
  }
);

server.get("/", (request, reply) => {
  reply.code(200).send("Running Up..");
});

for (let schema of [
  ...userSchemas,
  ...productSchemas,
  ...reviewSchema,
  ...addressSchema,
  ...cartSchema,
]) {
  server.addSchema(schema);
}

server.register(UserRoutes, { prefix: "api/user" });
server.register(ProductRoutes, { prefix: "api/product" });
server.register(ReviewRoutes, { prefix: "api/review" });
server.register(AddressRoutes, { prefix: "api/address" });
server.register(CartRoutes, { prefix: "api/cart" });

server
  .listen({ port: 8080 })
  .then(() => console.log(`Process running on http://localhost:8080`))
  .catch((err) => {
    console.log({ err });
  });
