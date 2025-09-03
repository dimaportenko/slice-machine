import {
  UpdateSliceScreenshotInputSchema,
  type UpdateSliceScreenshotInput,
} from "../schemas/screenshot.js";
import {
  validateAndParseImage,
  formatImageSize,
} from "../utils/imageValidator.js";
import { managerClient } from "../services/managerClient.js";

export const updateSliceScreenshotTool = {
  name: "updateSliceScreenshot",
  title: "Update Slice Screenshot",
  description:
    "Update the screenshot for a specific variation of a Prismic slice using base64-encoded image data",
  inputSchema: UpdateSliceScreenshotInputSchema,
  handler: async ({
    libraryID,
    sliceID,
    variationID,
    imageData,
  }: UpdateSliceScreenshotInput) => {
    try {
      // Validate and parse the image data
      const imageValidation = validateAndParseImage(imageData);
      
      if (!imageValidation.isValid) {
        return {
          content: [
            {
              type: "text" as const,
              text: `❌ Invalid image data: ${imageValidation.error}`,
            },
          ],
        };
      }

      const { buffer: imageBuffer, mimeType, size } = imageValidation;

      // Read the existing slice to validate it exists
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

      // Validate that the variation exists
      const variation = existingSlice.variations.find(
        (v: any) => v.id === variationID,
      );
      if (!variation) {
        const availableVariations = existingSlice.variations
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

      // Update the screenshot using the manager client
      const { errors: updateErrors } =
        await managerClient.slices.updateSliceScreenshot({
          libraryID,
          sliceID,
          variationID,
          data: imageBuffer!,
        });

      if (updateErrors?.length) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Failed to update screenshot: ${updateErrors.join(", ")}`,
            },
          ],
        };
      }

      // Success response with details
      const sizeFormatted = formatImageSize(size!);
      return {
        content: [
          {
            type: "text" as const,
            text: [
              `✅ Successfully updated screenshot for variation "${variationID}" of slice "${sliceID}"`,
              "",
              "Details:",
              `  • Library: ${libraryID}`,
              `  • Slice: ${sliceID}`,
              `  • Variation: ${variationID}`,
              `  • Image type: ${mimeType}`,
              `  • Image size: ${sizeFormatted}`,
            ].join("\n"),
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
            text: `❌ Error updating slice screenshot: ${errorMessage}`,
          },
        ],
      };
    }
  },
};