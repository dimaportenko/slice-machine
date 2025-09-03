import {
  AddFieldInputSchema,
  type AddFieldInput,
} from "../schemas/addField.js";
import { buildFieldConfig } from "../utils/fieldBuilder.js";
import { managerClient } from "../services/managerClient.js";
import { SharedSlice } from "../types.js";
import { FieldDefinition } from "../schemas/field.js";

export const addFieldToSliceTool = {
  name: "addFieldToSlice",
  title: "Add Field to Slice",
  description:
    "Add a new field to an existing Prismic slice in a specific zone (primary or items)",
  inputSchema: AddFieldInputSchema,
  handler: async ({
    libraryID,
    sliceID,
    variationID,
    zone,
    fieldName,
    fieldType,
    fieldLabel,
    fieldPlaceholder,
    fieldConfig,
  }: AddFieldInput) => {
    try {
      // First, read the existing slice
      const { model: existingSlice, errors: readErrors } =
        await managerClient.slices.readSlice({
          libraryID,
          sliceID,
        });

      if (readErrors?.length) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Failed to read slice: ${readErrors.join(", ")}`,
            },
          ],
        };
      }

      if (!existingSlice) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Slice "${sliceID}" not found in library ${libraryID}`,
            },
          ],
        };
      }

      // Create field definition
      const fieldDefinition: FieldDefinition = {
        name: fieldName,
        type: fieldType,
        label: fieldLabel,
        placeholder: fieldPlaceholder,
      };

      // Build field configuration using the utility
      const fieldConfigObj = buildFieldConfig(fieldDefinition);

      // Clone the existing slice to avoid mutations
      const updatedSlice: SharedSlice = JSON.parse(
        JSON.stringify(existingSlice),
      );

      // Find the specified variation
      const targetVariation = updatedSlice.variations.find(
        (variation: any) => variation.id === variationID
      );
      
      if (!targetVariation) {
        const availableVariations = updatedSlice.variations
          .map((v: any) => v.id)
          .join(", ");
        return {
          content: [
            {
              type: "text" as const,
              text: `Variation "${variationID}" not found in slice "${sliceID}". Available variations: ${availableVariations}`,
            },
          ],
        };
      }

      // Check if field already exists in the target zone
      const targetZone = targetVariation[zone] || {};
      if (targetZone[fieldName]) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Field "${fieldName}" already exists in ${zone} zone of variation "${variationID}" in slice "${sliceID}"`,
            },
          ],
        };
      }

      // Add the field to the zone
      const updatedZone = {
        ...targetZone,
        [fieldName]: {
          ...fieldConfigObj,
          // Merge any additional field config provided by the user
          config: {
            ...fieldConfigObj.config,
            ...fieldConfig,
          },
        } as any,
      };

      // Update the variation with the new field
      targetVariation[zone] = updatedZone;

      // Update the slice using the manager client
      const { errors: updateErrors } = await managerClient.slices.updateSlice({
        libraryID,
        model: updatedSlice,
      });

      if (updateErrors?.length) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Failed to update slice: ${updateErrors.join(", ")}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: `✅ Successfully added field "${fieldName}" (${fieldType}) to ${zone} zone of variation "${variationID}" in slice "${sliceID}" in library ${libraryID}`,
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return {
        content: [
          {
            type: "text" as const,
            text: `❌ Error adding field to slice: ${errorMessage}`,
          },
        ],
      };
    }
  },
};
