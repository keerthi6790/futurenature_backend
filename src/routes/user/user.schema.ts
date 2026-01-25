import { buildJsonSchemas } from "fastify-zod";
import z from "zod";

export const TriggerOtpRequestSchema = z.object({
  mobileNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, { message: "Invalid mobile number. Must be a 10-digit Indian number starting with 6-9." }),
});

export const ResponseSchema = z.object({
  status: z.boolean({
    required_error: "Status is Required",
    invalid_type_error: "Status must be boolean",
  }),
  message: z.string({
    required_error: "Message is Required",
  }),
});

export const VerityOtpRequestSchema = z.object({
  mobileNumber: z
    .string({
      required_error: "Mobile Number is Required",
    })
    .regex(/^[6-9]\d{9}$/, { message: "Invalid mobile number. Must be a 10-digit Indian number starting with 6-9." }),
  otp: z.string({
    required_error: "Otp is Required",
  }),
});

export const CreateUserRequestSchema = z.object({
  firstName: z.string({
    required_error: "First Name is Required",
  }),
  lastName: z.string({
    required_error: "Last Name is Required",
  }),
  mobileNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, { message: "Invalid mobile number. Must be a 10-digit Indian number starting with 6-9." }),
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(10, {
      message: "Atleast 10 characters is required",
    }),
});

export const CreateUserResponseSchema = z.object({
  message: z.string({
    required_error: "Message is required",
  }),
});

export type ZodTriggerOtpRequestSchema = z.infer<
  typeof TriggerOtpRequestSchema
>;
export type ZodVerityOtpRequestSchema = z.infer<typeof VerityOtpRequestSchema>;
export type ZodResponseSchema = z.infer<typeof ResponseSchema>;

export type ZodCreateUserRequestSchema = z.infer<
  typeof CreateUserRequestSchema
>;
export type ZodCreateUserResponseSchema = z.infer<
  typeof CreateUserRequestSchema
>;

export const { schemas: userSchemas, $ref } = buildJsonSchemas(
  {
    TriggerOtpRequestSchema,
    ResponseSchema,
    VerityOtpRequestSchema,
    CreateUserRequestSchema,
    CreateUserResponseSchema,
  },
  { $id: "userSchemas" }
);
