import {
  DeleteFieldInputSchema,
  type DeleteFieldInput,
} from "../schemas/deleteField.js";
import { managerClient } from "../services/managerClient.js";
import { SharedSlice } from "../types.js";

export const deleteFieldFromSliceTool = {
  name: "deleteFieldFromSlice",
  title: "Delete Field from Slice",
  description:
    "Delete an existing field from a Prismic slice in a specific zone (primary or items)",
  inputSchema: DeleteFieldInputSchema,
  handler: async ({
    libraryID,
    sliceID,
    zone,
    fieldName,
  }: DeleteFieldInput) => {
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

      // Clone the existing slice to avoid mutations
      const updatedSlice: SharedSlice = JSON.parse(
        JSON.stringify(existingSlice),
      );

      // Get the default variation
      const defaultVariation = updatedSlice.variations[0];
      if (!defaultVariation) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No default variation found for slice "${sliceID}"`,
            },
          ],
        };
      }

      // Check if field exists in the target zone
      const targetZone = defaultVariation[zone] || {};
      if (!targetZone[fieldName]) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Field "${fieldName}" does not exist in ${zone} zone of slice "${sliceID}"`,
            },
          ],
        };
      }

      // Delete the field from the zone using object destructuring
      const { [fieldName]: deletedField, ...remainingFields } = targetZone;

      // Update the variation with the field removed
      defaultVariation[zone] = remainingFields as any;

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
            text: `✅ Successfully deleted field "${fieldName}" from ${zone} zone of slice "${sliceID}" in library ${libraryID}`,
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
            text: `❌ Error deleting field from slice: ${errorMessage}`,
          },
        ],
      };
    }
  },
};
