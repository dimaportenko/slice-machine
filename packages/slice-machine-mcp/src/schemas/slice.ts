import { z } from "zod";
import { SliceFieldsSchema } from "./field.js";
import { SliceIDSchema, VariationIDSchema } from "./common.js";

export const SliceVariationSchema = z.object({
  id: VariationIDSchema.describe("Variation ID (e.g., 'default', 'with_background')"),
  name: z.string().describe("Human-readable variation name"),
  description: z.string().optional().describe("Variation description"),
  fields: SliceFieldsSchema.optional().describe(
    "Field configuration for primary and items zones for this variation",
  ),
});

export const CreateSliceInputSchema = z.object({
  libraryID: z.string().min(1).describe("Library path (e.g., './src/slices')"),
  sliceName: z.string().min(1).describe("Human-readable slice name"),
  sliceID: SliceIDSchema.describe("Snake_case slice ID"),
  description: z.string().optional().describe("Slice description"),
  fields: SliceFieldsSchema.optional().describe(
    "Field configuration for primary and items zones for default variation",
  ),
  variations: z.array(SliceVariationSchema).optional().describe(
    "Array of variations to create (if not provided, only 'default' variation will be created)",
  ),
});

export type CreateSliceInput = z.infer<typeof CreateSliceInputSchema>;

export const LibrarySchema = z.object({
  name: z.string(),
  path: z.string(),
  isLocal: z.boolean(),
  components: z.array(z.unknown()).optional(),
  meta: z.object({}).passthrough().optional(),
});

export type Library = z.infer<typeof LibrarySchema>;

export const StateSchema = z.object({
  libraries: z.array(LibrarySchema).optional().default([]),
});

export type State = z.infer<typeof StateSchema>;
