import { JWT } from "@fastify/jwt";

declare module "fastify" {
  interface FastifyRequest {
    jwt: JWT;
  }
  export interface FastifyInstance {
    authenticate: any;
  }
}
type UserPayload = {
  id: string;
  isAdmin: string;
};
declare module "fastify-jwt" {
  interface FastifyJWT {
    user: UserPayload;
  }
}

declare module "googleapis" {
  google: any;
}

declare module "@aws-sdk/client-s3" {
  PutObjectCommand: any;
  S3Client: any;
}
