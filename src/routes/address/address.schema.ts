import { buildJsonSchemas } from "fastify-zod";
import * as z from "zod";

const AddAddressRequestSchema = z.object({
  address1: z.string({
    required_error: "Address 1 is mandatory",
  }),
  address2: z.string({
    required_error: "Address 1 is mandatory",
  }),
  address3: z.string({
    required_error: "Address 1 is mandatory",
  }),
  address4: z
    .string({
      required_error: "Address 1 is mandatory",
    })
    .optional(),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, {
    message:
      "Invalid Indian PIN code. Must be a 6-digit number starting from 1-9.",
  }),
  district: z.string({
    required_error: "District is required",
  }),
  city: z.string({
    required_error: "City is Required",
  }),
  state: z.string({
    required_error: "State is Required",
  }),
  mobileNumber: z
    .string({
      required_error: "Mobile Number is Required",
    })
    .min(10, { message: "Mobile number must be at least 10 digits long." })
    .max(10, { message: "Mobile number cannot exceed 10 digits." })
    .regex(/^\+?[1-9]\d{1,10}$/, { message: "Invalid mobile number format." }),
});

const EditAddressRequestSchema = z.object({
  address1: z
    .string({
      required_error: "Address 1 is mandatory",
    })
    .optional(),
  address2: z
    .string({
      required_error: "Address 1 is mandatory",
    })
    .optional(),
  address3: z
    .string({
      required_error: "Address 1 is mandatory",
    })
    .optional(),
  address4: z
    .string({
      required_error: "Address 1 is mandatory",
    })
    .optional(),
  pincode: z
    .string()
    .regex(/^[1-9][0-9]{5}$/, {
      message:
        "Invalid Indian PIN code. Must be a 6-digit number starting from 1-9.",
    })
    .optional(),
  district: z
    .string({
      required_error: "District is required",
    })
    .optional(),
  city: z
    .string({
      required_error: "City is Required",
    })
    .optional(),
  state: z
    .string({
      required_error: "State is Required",
    })
    .optional(),
  mobileNumber: z
    .string({
      required_error: "Mobile Number is Required",
    })
    .min(10, { message: "Mobile number must be at least 10 digits long." })
    .max(10, { message: "Mobile number cannot exceed 10 digits." })
    .regex(/^\+?[1-9]\d{1,10}$/, { message: "Invalid mobile number format." })
    .optional(),
});

export type ZodAddAddressRequestSchema = z.infer<
  typeof AddAddressRequestSchema
>;

export type ZodEditAddressRequestSchema = z.infer<
  typeof EditAddressRequestSchema
>;

export const { schemas: addressSchema, $ref } = buildJsonSchemas(
  {
    AddAddressRequestSchema,
    EditAddressRequestSchema,
  },
  { $id: "addressSchema" }
);
