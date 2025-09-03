import { z } from "zod";
import { SliceIDSchema, VariationIDSchema } from "./common.js";
import { SliceZoneSchema } from "./addField.js";

export const DeleteFieldInputSchema = z.object({
  libraryID: z
    .string()
    .min(1)
    .describe("Library path (e.g., './src/slices')"),
  sliceID: SliceIDSchema.describe("Snake_case slice ID"),
  variationID: VariationIDSchema.optional().default("default").describe("Variation ID to delete field from (defaults to 'default')"),
  zone: SliceZoneSchema.describe(
    "Zone where to delete the field (primary or items)",
  ),
  fieldName: z
    .string()
    .regex(
      /^[a-z][a-z0-9_]*$/,
      "Field name must be snake_case (e.g., field_name)",
    )
    .describe("Field identifier to delete"),
});

export type DeleteFieldInput = z.infer<typeof DeleteFieldInputSchema>;