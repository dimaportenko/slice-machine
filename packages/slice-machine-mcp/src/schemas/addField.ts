import { z } from "zod";
import { FieldTypeSchema } from "./field.js";
import { SliceIDSchema } from "./slice.js";

export const SliceZoneSchema = z.enum(["primary", "items"]);

export type SliceZone = z.infer<typeof SliceZoneSchema>;

export const AddFieldInputSchema = z.object({
  libraryID: z.string().min(1).describe("Library path (e.g., './src/slices')"),
  sliceID: SliceIDSchema.describe("Snake_case slice ID"),
  zone: SliceZoneSchema.describe(
    "Zone where to add the field (primary or items)",
  ),
  fieldName: z
    .string()
    .regex(
      /^[a-z][a-z0-9_]*$/,
      "Field name must be snake_case (e.g., field_name)",
    )
    .describe("Field identifier in snake_case"),
  fieldType: FieldTypeSchema.describe("Type of field to add"),
  fieldLabel: z.string().optional().describe("Human-readable field label"),
  fieldPlaceholder: z
    .string()
    .optional()
    .describe("Placeholder text for the field"),
  fieldConfig: z
    .record(z.any())
    .optional()
    .describe("Additional field-specific configuration"),
});

export type AddFieldInput = z.infer<typeof AddFieldInputSchema>;
