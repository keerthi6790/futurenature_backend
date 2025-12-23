import { buildJsonSchemas } from "fastify-zod";
import z from "zod";

const AddProductsRequestSchme = z.object({
  productName: z.string({
    required_error: "Product Name is Required",
  }),
  productNameTamil: z.string({
    required_error: "Product Name in tamil is Required",
  }),
  descriptionTamil: z.string({
    required_error: "Description in tamil is Required",
  }),
  description: z.string({
    required_error: "Description is Required",
  }),
  discountedType: z.enum(["percentage", "mrp"], {
    required_error: "Discounted type is required",
    invalid_type_error:
      "Discounted value only accept two values, percentage or mrp",
  }),
  discountedAmount: z.string({
    required_error: "Discounted amount is required",
  }),
  price: z.string({
    required_error: "Price is Required",
  }),
  imageUrl: z.array(
    z.string({
      required_error: "Image url is Required",
    })
  ),
  availableQuantity: z
    .string({
      required_error: "Available Quantity is Required",
    })
    .optional(),

  variants: z.array(
    z.object({
      attributeName: z.string({
        required_error: "Name is Required",
      }),
      price: z.string({
        required_error: "Price is Required",
      }),
      title: z.string({
        required_error: "Price is Required",
      }),
      imageUrl: z.array(
        z.string({
          required_error: "Image url is Required",
        })
      ),
      discountedType: z.enum(["percentage", "mrp"], {
        required_error: "Discounted type is required",
        invalid_type_error:
          "Discounted value only accept two values, percentage or mrp",
      }),
      discountedAmount: z.string({
        required_error: "Discounted amount is required",
      }),
      availableQuantity: z
        .string({
          required_error: "Available Quantity is Required",
        })
        .optional(),
    })
  ),
});

export type ZodAddProductsRequestSchme = z.infer<
  typeof AddProductsRequestSchme
>;

export const { schemas: productSchemas, $ref } = buildJsonSchemas(
  {
    AddProductsRequestSchme,
  },
  { $id: "productSchemas" }
);
