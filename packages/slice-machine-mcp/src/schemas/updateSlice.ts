import { z } from "zod";
import { FieldTypeSchema } from "./field.js";
import { SliceIDSchema } from "./slice.js";
import { SliceZoneSchema } from "./addField.js";

// Define operation types
export const FieldOperationTypeSchema = z.enum([
  "add",
  "update",
  "delete",
  "rename",
]);

export type FieldOperationType = z.infer<typeof FieldOperationTypeSchema>;

// Base operation schema
const BaseOperationSchema = z.object({
  type: FieldOperationTypeSchema,
  zone: SliceZoneSchema,
  fieldName: z
    .string()
    .regex(
      /^[a-z][a-z0-9_]*$/,
      "Field name must be snake_case (e.g., field_name)",
    ),
});

// Specific operation schemas
const AddOperationSchema = BaseOperationSchema.extend({
  type: z.literal("add"),
  fieldType: FieldTypeSchema,
  fieldLabel: z.string().optional(),
  fieldPlaceholder: z.string().optional(),
  fieldConfig: z.record(z.any()).optional(),
});

const UpdateOperationSchema = BaseOperationSchema.extend({
  type: z.literal("update"),
  newFieldType: FieldTypeSchema.optional(),
  newFieldLabel: z.string().optional(),
  newFieldPlaceholder: z.string().optional(),
  newFieldConfig: z.record(z.any()).optional(),
});

const DeleteOperationSchema = BaseOperationSchema.extend({
  type: z.literal("delete"),
});

const RenameOperationSchema = BaseOperationSchema.extend({
  type: z.literal("rename"),
  newFieldName: z
    .string()
    .regex(
      /^[a-z][a-z0-9_]*$/,
      "New field name must be snake_case (e.g., field_name)",
    ),
});

// Union of all operations using discriminated union
export const FieldOperationSchema = z.discriminatedUnion("type", [
  AddOperationSchema,
  UpdateOperationSchema,
  DeleteOperationSchema,
  RenameOperationSchema,
]);

export type FieldOperation = z.infer<typeof FieldOperationSchema>;

// Operation result schema
export const OperationResultSchema = z.object({
  operation: FieldOperationTypeSchema,
  fieldName: z.string(),
  zone: SliceZoneSchema,
  success: z.boolean(),
  error: z.string().optional(),
});

export type OperationResult = z.infer<typeof OperationResultSchema>;

// Main input schema
export const UpdateSliceInputSchema = z.object({
  libraryID: z
    .string()
    .min(1)
    .describe("Library path (e.g., './src/slices')"),
  sliceID: SliceIDSchema.describe("Snake_case slice ID"),
  operations: z
    .array(FieldOperationSchema)
    .min(1)
    .describe("Array of field operations to perform"),
  transactional: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      "If true, all operations succeed or all fail. If false, apply operations individually.",
    ),
});

export type UpdateSliceInput = z.infer<typeof UpdateSliceInputSchema>;