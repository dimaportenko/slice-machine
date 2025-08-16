import { z } from "zod";
import { SliceIDSchema } from "./slice.js";
import { SliceZoneSchema } from "./addField.js";

export const DeleteFieldInputSchema = z.object({
  libraryID: z
    .string()
    .min(1)
    .describe("Library path (e.g., './src/slices')"),
  sliceID: SliceIDSchema.describe("Snake_case slice ID"),
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