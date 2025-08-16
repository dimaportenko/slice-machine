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
  }: CreateSliceInput) => {
    try {
      // Build field configurations
      const primaryFields = buildFieldsConfiguration(fields?.primary);
      const itemsFields = buildFieldsConfiguration(fields?.items);

      // Create the slice model
      const model: SharedSlice = {
        id: sliceID,
        type: "SharedSlice",
        name: sliceName,
        description: description || sliceName,
        variations: [
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
        ],
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

      return {
        content: [
          {
            type: "text" as const,
            text: `✅ Successfully created slice "${sliceID}" in library ${libraryID}`,
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
