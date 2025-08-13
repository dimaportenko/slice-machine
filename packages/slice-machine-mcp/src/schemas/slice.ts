import { z } from "zod";
import { SliceFieldsSchema } from "./field.js";

export const SliceIDSchema = z
  .string()
  .regex(/^[a-z][a-z0-9_]*$/, "Slice ID must be snake_case (e.g., hero_section)");

export const CreateSliceInputSchema = z.object({
  libraryID: z.string().min(1).describe("Library path (e.g., './src/slices')"),
  sliceName: z.string().min(1).describe("Human-readable slice name"),
  sliceID: SliceIDSchema.describe("Snake_case slice ID"),
  description: z.string().optional().describe("Slice description"),
  fields: SliceFieldsSchema.optional().describe("Field configuration for primary and items zones"),
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