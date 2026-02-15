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
  email: z.string({
    required_error: "Email is Required",
  }).email({ message: "Invalid email address" }),
  dob: z.string({
    required_error: "Date of Birth is Required",
  }),
  isWhatsappOptIn: z.boolean().default(false),
  mobileNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, { message: "Invalid mobile number. Must be a 10-digit Indian number starting with 6-9." }),
});

export const CreateUserResponseSchema = z.object({
  status: z.boolean(),
  message: z.string({
    required_error: "Message is required",
  }),
  data: z.object({
    token: z.string(),
  }).optional(),
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
