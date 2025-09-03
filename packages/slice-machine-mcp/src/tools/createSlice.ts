import {
  CreateSliceInputSchema,
  type CreateSliceInput,
} from "../schemas/slice.js";
import { buildFieldsConfiguration } from "../utils/fieldBuilder.js";
import { managerClient } from "../services/managerClient.js";
import { SharedSlice } from "../types.js";

export const createSliceTool = {
  name: "createSlice",
  title: "Create Slice",
  description: "Create a new Prismic slice in a library",
  inputSchema: CreateSliceInputSchema,
  handler: async ({
    libraryID,
    sliceName,
    sliceID,
    description,
    fields,
    variations,
  }: CreateSliceInput) => {
    try {
      // Build variations array
      let variationsToCreate: any[] = [];
      
      if (variations && variations.length > 0) {
        // Use provided variations
        variationsToCreate = variations.map((variation) => {
          const varPrimaryFields = buildFieldsConfiguration(variation.fields?.primary);
          const varItemsFields = buildFieldsConfiguration(variation.fields?.items);
          
          return {
            id: variation.id,
            name: variation.name,
            description: variation.description || variation.name,
            docURL: "...",
            version: "initial",
            imageUrl: "",
            primary: varPrimaryFields as any,
            items: varItemsFields as any,
          };
        });
      } else {
        // Create default variation with provided fields or empty fields
        const primaryFields = buildFieldsConfiguration(fields?.primary);
        const itemsFields = buildFieldsConfiguration(fields?.items);
        
        variationsToCreate = [
          {
            id: "default",
            name: "Default",
            description: "Default",
            docURL: "...",
            version: "initial",
            imageUrl: "",
            primary: primaryFields as any,
            items: itemsFields as any,
          },
        ];
      }

      // Create the slice model
      const model: SharedSlice = {
        id: sliceID,
        type: "SharedSlice",
        name: sliceName,
        description: description || sliceName,
        variations: variationsToCreate,
      };

      // Call the manager client to create the slice
      const { errors } = await managerClient.slices.createSlice({
        libraryID,
        model,
      });

      if (errors?.length) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Failed to create slice: ${errors.join(", ")}`,
            },
          ],
        };
      }

      const variationNames = variationsToCreate.map(v => v.name).join(", ");
      
      return {
        content: [
          {
            type: "text" as const,
            text: `✅ Successfully created slice "${sliceID}" in library ${libraryID} with ${variationsToCreate.length} variation(s): ${variationNames}`,
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
            text: `❌ Error creating slice: ${errorMessage}`,
          },
        ],
      };
    }
  },
};
