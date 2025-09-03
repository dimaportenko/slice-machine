import { z } from "zod";
import { SliceIDSchema, VariationIDSchema } from "./common.js";

export const AddVariantInputSchema = z.object({
  libraryID: z
    .string()
    .min(1)
    .describe("Library path (e.g., './src/slices')"),
  sliceID: SliceIDSchema.describe("Snake_case slice ID"),
  variantID: VariationIDSchema.describe("New variant ID (camelCase, e.g., 'withBackground')"),
  variantName: z
    .string()
    .min(1)
    .max(30)
    .describe("Human-readable variant name (e.g., 'With Background')"),
  sourceVariantID: VariationIDSchema
    .optional()
    .default("default")
    .describe("Source variant ID to copy from (defaults to 'default')"),
});

export type AddVariantInput = z.infer<typeof AddVariantInputSchema>;