import { DEFAULT_FIELD_CONFIG } from "../config/constants.js";
import type { FieldDefinition } from "../schemas/field.js";

export interface FieldConfig {
  type: string;
  config: Record<string, any>;
}

export function buildFieldConfig(field: FieldDefinition): FieldConfig {
  const baseConfig: Record<string, any> = {
    label: field.label || field.name,
    placeholder: field.placeholder || "",
  };

  switch (field.type) {
    case "Image":
      return {
        type: field.type,
        config: {
          ...baseConfig,
          ...DEFAULT_FIELD_CONFIG.image,
        },
      };

    case "Link":
      return {
        type: field.type,
        config: {
          ...baseConfig,
          ...DEFAULT_FIELD_CONFIG.link,
        },
      };

    case "StructuredText":
      return {
        type: field.type,
        config: {
          ...baseConfig,
          ...DEFAULT_FIELD_CONFIG.structuredText,
        },
      };

    case "Boolean":
      return {
        type: field.type,
        config: {
          ...baseConfig,
          default_value: false,
        },
      };

    case "Number":
    case "Range":
      return {
        type: field.type,
        config: {
          ...baseConfig,
        },
      };

    case "Select":
      return {
        type: field.type,
        config: {
          ...baseConfig,
          options: [],
        },
      };

    case "Date":
    case "Timestamp":
      return {
        type: field.type,
        config: {
          ...baseConfig,
        },
      };

    case "Color":
    case "GeoPoint":
    case "Embed":
    case "Text":
    default:
      return {
        type: field.type,
        config: baseConfig,
      };
  }
}

export function buildFieldsConfiguration(
  fields?: FieldDefinition[]
): Record<string, FieldConfig> {
  if (!fields || fields.length === 0) {
    return {};
  }

  const configuration: Record<string, FieldConfig> = {};
  
  for (const field of fields) {
    configuration[field.name] = buildFieldConfig(field);
  }

  return configuration;
}