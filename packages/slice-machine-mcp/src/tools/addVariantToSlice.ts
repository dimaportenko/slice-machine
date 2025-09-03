import {
  AddVariantInputSchema,
  type AddVariantInput,
} from "../schemas/addVariant.js";
import { managerClient } from "../services/managerClient.js";
import { SharedSlice } from "../types.js";

export const addVariantToSliceTool = {
  name: "addVariantToSlice",
  title: "Add Variant to Slice",
  description:
    "Add a new variant to an existing Prismic slice by copying from an existing variant",
  inputSchema: AddVariantInputSchema,
  handler: async ({
    libraryID,
    sliceID,
    variantID,
    variantName,
    sourceVariantID,
  }: AddVariantInput) => {
    try {
      // Validate variant ID format (camelCase, no special characters)
      if (!/^[A-Za-z0-9]+([A-Za-z0-9]+)*$/.test(variantID)) {
        return {
          content: [
            {
              type: "text" as const,
              text: `❌ Invalid variant ID "${variantID}". Variant ID must be camelCase with no special characters (e.g., "withBackground", "gridLayout")`,
            },
          ],
        };
      }

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

      // Check if variant ID already exists
      const existingVariant = existingSlice.variations.find(
        (v: any) => v.id === variantID
      );
      
      if (existingVariant) {
        return {
          content: [
            {
              type: "text" as const,
              text: `❌ Variant "${variantID}" already exists in slice "${sliceID}"`,
            },
          ],
        };
      }

      // Find the source variation to copy from
      const sourceVariation = existingSlice.variations.find(
        (v: any) => v.id === sourceVariantID
      );

      if (!sourceVariation) {
        const availableVariations = existingSlice.variations
          .map((v: any) => v.id)
          .join(", ");
        return {
          content: [
            {
              type: "text" as const,
              text: `Source variant "${sourceVariantID}" not found in slice "${sliceID}". Available variants: ${availableVariations}`,
            },
          ],
        };
      }

      // Create new variation by copying the source variation
      const newVariation = {
        ...sourceVariation,
        id: variantID,
        name: variantName,
        description: variantName, // Use name as description
        version: "initial",
        imageUrl: "", // New variations start without screenshots
      };

      // Clone the existing slice and add the new variation
      const updatedSlice: SharedSlice = {
        ...existingSlice,
        variations: [...existingSlice.variations, newVariation],
      };

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
            text: `✅ Successfully added variant "${variantID}" ("${variantName}") to slice "${sliceID}" in library ${libraryID}. Copied from variant "${sourceVariantID}".`,
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
            text: `❌ Error adding variant to slice: ${errorMessage}`,
          },
        ],
      };
    }
  },
};