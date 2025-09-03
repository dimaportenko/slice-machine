import { z } from "zod";
import { SliceIDSchema, VariationIDSchema } from "./common.js";

// Schema for base64 encoded image data
export const Base64ImageSchema = z
  .string()
  .regex(
    /^data:image\/(png|jpeg|jpg|gif|webp);base64,/,
    "Image must be a base64-encoded data URL (e.g., data:image/png;base64,...)",
  );

// Main schema for updating screenshot
export const UpdateSliceScreenshotInputSchema = z.object({
  libraryID: z
    .string()
    .min(1)
    .describe("Library path (e.g., './src/slices')"),
  sliceID: SliceIDSchema.describe("Snake_case slice ID"),
  variationID: VariationIDSchema.describe("Variation ID (e.g., 'default')"),
  imageData: Base64ImageSchema.describe("Base64-encoded image data URL"),
});

export type UpdateSliceScreenshotInput = z.infer<
  typeof UpdateSliceScreenshotInputSchema
>;