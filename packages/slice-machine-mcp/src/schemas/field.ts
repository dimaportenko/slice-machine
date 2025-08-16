import { z } from "zod";

export const FieldTypeSchema = z.enum([
  "Text",
  "StructuredText",
  "Image",
  "Link",
  "Boolean",
  "Number",
  "Select",
  "Date",
  "Color",
  "GeoPoint",
  "Embed",
  "Timestamp",
  "IntegrationFields",
  "Group",
  "Range",
  "Separator",
  "Table",
]);

export type FieldType = z.infer<typeof FieldTypeSchema>;

export const FieldDefinitionSchema = z.object({
  name: z.string().min(1, "Field name is required"),
  type: FieldTypeSchema,
  label: z.string().optional(),
  placeholder: z.string().optional(),
});

export type FieldDefinition = z.infer<typeof FieldDefinitionSchema>;

export const SliceFieldsSchema = z.object({
  primary: z
    .array(FieldDefinitionSchema)
    .optional()
    .describe("Primary zone fields"),
  items: z
    .array(FieldDefinitionSchema)
    .optional()
    .describe("Repeater zone fields"),
});

export type SliceFields = z.infer<typeof SliceFieldsSchema>;
