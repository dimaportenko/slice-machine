import {
  UpdateSliceInputSchema,
  type UpdateSliceInput,
  type FieldOperation,
  type OperationResult,
} from "../schemas/updateSlice.js";
import { buildFieldConfig } from "../utils/fieldBuilder.js";
import { validateOperations, createOperationResults } from "../utils/operationValidator.js";
import { managerClient } from "../services/managerClient.js";
import { SharedSlice } from "../types.js";
import { FieldDefinition } from "../schemas/field.js";

export const updateSliceTool = {
  name: "updateSlice",
  title: "Update Slice Fields",
  description:
    "Perform multiple field operations (add, update, delete, rename) on a Prismic slice in a single transaction",
  inputSchema: UpdateSliceInputSchema,
  handler: async ({
    libraryID,
    sliceID,
    operations,
    transactional,
  }: UpdateSliceInput) => {
    try {
      // Read the existing slice
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

      // Get default variation
      const defaultVariation = existingSlice.variations[0];
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

      // Validate operations if in transactional mode
      if (transactional) {
        const validation = validateOperations(operations, existingSlice);
        if (!validation.isValid) {
          const errorMessages = validation.errors.map(
            (error) => `${error.operation.type} "${error.operation.fieldName}": ${error.message}`,
          );
          return {
            content: [
              {
                type: "text" as const,
                text: `❌ Operation validation failed:\n${errorMessages.join("\n")}`,
              },
            ],
          };
        }
      }

      // Clone the slice to avoid mutations
      const updatedSlice: SharedSlice = JSON.parse(
        JSON.stringify(existingSlice),
      );
      const updatedVariation = updatedSlice.variations[0];

      // Track operation results
      const operationResults: OperationResult[] = [];
      let appliedOperations = 0;

      // Apply operations sequentially
      for (const operation of operations) {
        try {
          const targetZone = updatedVariation[operation.zone] || {};

          switch (operation.type) {
            case "add": {
              // Check if field already exists (for non-transactional mode)
              if (targetZone[operation.fieldName]) {
                if (!transactional) {
                  operationResults.push({
                    operation: operation.type,
                    fieldName: operation.fieldName,
                    zone: operation.zone,
                    success: false,
                    error: `Field already exists`,
                  });
                  continue;
                }
              }

              // Create field definition
              const fieldDefinition: FieldDefinition = {
                name: operation.fieldName,
                type: operation.fieldType,
                label: operation.fieldLabel,
                placeholder: operation.fieldPlaceholder,
              };

              // Build field configuration
              const fieldConfigObj = buildFieldConfig(fieldDefinition);

              // Add the field
              const updatedZone = {
                ...targetZone,
                [operation.fieldName]: {
                  ...fieldConfigObj,
                  config: {
                    ...fieldConfigObj.config,
                    ...operation.fieldConfig,
                  },
                } as any,
              };

              updatedVariation[operation.zone] = updatedZone;
              appliedOperations++;

              operationResults.push({
                operation: operation.type,
                fieldName: operation.fieldName,
                zone: operation.zone,
                success: true,
              });
              break;
            }

            case "update": {
              // Check if field exists
              if (!targetZone[operation.fieldName]) {
                if (!transactional) {
                  operationResults.push({
                    operation: operation.type,
                    fieldName: operation.fieldName,
                    zone: operation.zone,
                    success: false,
                    error: `Field does not exist`,
                  });
                  continue;
                }
              }

              // Update field properties
              const existingField = targetZone[operation.fieldName];
              const updatedField = { ...existingField };

              if (operation.newFieldType) {
                updatedField.type = operation.newFieldType;
              }

              if (operation.newFieldLabel || operation.newFieldPlaceholder || operation.newFieldConfig) {
                updatedField.config = {
                  ...existingField.config,
                  ...(operation.newFieldLabel && { label: operation.newFieldLabel }),
                  ...(operation.newFieldPlaceholder && { placeholder: operation.newFieldPlaceholder }),
                  ...operation.newFieldConfig,
                };
              }

              const updatedZone = {
                ...targetZone,
                [operation.fieldName]: updatedField,
              };

              updatedVariation[operation.zone] = updatedZone as any;
              appliedOperations++;

              operationResults.push({
                operation: operation.type,
                fieldName: operation.fieldName,
                zone: operation.zone,
                success: true,
              });
              break;
            }

            case "delete": {
              // Check if field exists
              if (!targetZone[operation.fieldName]) {
                if (!transactional) {
                  operationResults.push({
                    operation: operation.type,
                    fieldName: operation.fieldName,
                    zone: operation.zone,
                    success: false,
                    error: `Field does not exist`,
                  });
                  continue;
                }
              }

              // Delete the field using object destructuring
              const { [operation.fieldName]: deletedField, ...remainingFields } = targetZone;
              updatedVariation[operation.zone] = remainingFields as any;
              appliedOperations++;

              operationResults.push({
                operation: operation.type,
                fieldName: operation.fieldName,
                zone: operation.zone,
                success: true,
              });
              break;
            }

            case "rename": {
              // Check if source field exists
              if (!targetZone[operation.fieldName]) {
                if (!transactional) {
                  operationResults.push({
                    operation: operation.type,
                    fieldName: operation.fieldName,
                    zone: operation.zone,
                    success: false,
                    error: `Source field does not exist`,
                  });
                  continue;
                }
              }

              // Check if target field name already exists
              if (targetZone[operation.newFieldName]) {
                if (!transactional) {
                  operationResults.push({
                    operation: operation.type,
                    fieldName: operation.fieldName,
                    zone: operation.zone,
                    success: false,
                    error: `Target field name already exists`,
                  });
                  continue;
                }
              }

              // Rename field (copy config to new name, delete old)
              const fieldConfig = targetZone[operation.fieldName];
              const { [operation.fieldName]: oldField, ...remainingFields } = targetZone;

              const updatedZone = {
                ...remainingFields,
                [operation.newFieldName]: fieldConfig,
              };

              updatedVariation[operation.zone] = updatedZone as any;
              appliedOperations++;

              operationResults.push({
                operation: operation.type,
                fieldName: operation.fieldName,
                zone: operation.zone,
                success: true,
              });
              break;
            }
          }
        } catch (operationError) {
          const errorMessage = operationError instanceof Error 
            ? operationError.message 
            : String(operationError);

          operationResults.push({
            operation: operation.type,
            fieldName: operation.fieldName,
            zone: operation.zone,
            success: false,
            error: errorMessage,
          });

          // In transactional mode, fail fast
          if (transactional) {
            return {
              content: [
                {
                  type: "text" as const,
                  text: `❌ Operation failed: ${operation.type} "${operation.fieldName}" - ${errorMessage}`,
                },
              ],
            };
          }
        }
      }

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

      // Generate success message
      const successfulOps = operationResults.filter(r => r.success);
      const failedOps = operationResults.filter(r => !r.success);

      const resultSummary = [
        `✅ Successfully applied ${appliedOperations}/${operations.length} operations to slice "${sliceID}"`,
        "",
        ...successfulOps.map(r => `  ✓ ${r.operation} "${r.fieldName}" in ${r.zone} zone`),
      ];

      if (failedOps.length > 0) {
        resultSummary.push(
          "",
          "❌ Failed operations:",
          ...failedOps.map(r => `  ✗ ${r.operation} "${r.fieldName}": ${r.error}`)
        );
      }

      return {
        content: [
          {
            type: "text" as const,
            text: resultSummary.join("\n"),
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      return {
        content: [
          {
            type: "text" as const,
            text: `❌ Error updating slice: ${errorMessage}`,
          },
        ],
      };
    }
  },
};