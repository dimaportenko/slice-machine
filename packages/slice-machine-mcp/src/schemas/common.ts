import { z } from "zod";

// Common schema for slice IDs used across multiple schema files
export const SliceIDSchema = z
  .string()
  .regex(
    /^[a-z][a-z0-9_]*$/,
    "Slice ID must be snake_case (e.g., hero_section)",
  );

// Common schema for variation IDs used across multiple schema files
export const VariationIDSchema = z
  .string()
  .regex(
    /^[a-z][a-zA-Z0-9]*$/,
    "Variation ID must be camelCase (e.g., default, variationName)",
  );