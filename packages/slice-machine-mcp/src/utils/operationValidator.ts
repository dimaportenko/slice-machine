import { FieldOperation, OperationResult } from "../schemas/updateSlice.js";
import { SharedSlice } from "../types.js";

export interface ValidationError {
  operation: FieldOperation;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validates all operations before applying them to ensure consistency
 */
export function validateOperations(
  operations: FieldOperation[],
  slice: SharedSlice,
): ValidationResult {
  const errors: ValidationError[] = [];
  const defaultVariation = slice.variations[0];

  if (!defaultVariation) {
    return {
      isValid: false,
      errors: [
        {
          operation: operations[0],
          message: "No default variation found in slice",
        },
      ],
    };
  }

  // Track field states across operations
  const fieldStates = new Map<string, { exists: boolean; zone: string }>();

  // Initialize with existing fields
  const primaryFields = defaultVariation.primary || {};
  const itemsFields = defaultVariation.items || {};

  Object.keys(primaryFields).forEach((fieldName) => {
    fieldStates.set(`primary:${fieldName}`, {
      exists: true,
      zone: "primary",
    });
  });

  Object.keys(itemsFields).forEach((fieldName) => {
    fieldStates.set(`items:${fieldName}`, { exists: true, zone: "items" });
  });

  // Validate each operation in sequence
  for (const operation of operations) {
    const fieldKey = `${operation.zone}:${operation.fieldName}`;
    const fieldState = fieldStates.get(fieldKey);

    switch (operation.type) {
      case "add":
        if (fieldState?.exists) {
          errors.push({
            operation,
            message: `Cannot add field "${operation.fieldName}" - field already exists in ${operation.zone} zone`,
          });
        } else {
          // Mark field as added
          fieldStates.set(fieldKey, { exists: true, zone: operation.zone });
        }
        break;

      case "update":
        if (!fieldState?.exists) {
          errors.push({
            operation,
            message: `Cannot update field "${operation.fieldName}" - field does not exist in ${operation.zone} zone`,
          });
        }
        break;

      case "delete":
        if (!fieldState?.exists) {
          errors.push({
            operation,
            message: `Cannot delete field "${operation.fieldName}" - field does not exist in ${operation.zone} zone`,
          });
        } else {
          // Mark field as deleted
          fieldStates.set(fieldKey, { exists: false, zone: operation.zone });
        }
        break;

      case "rename":
        if (!fieldState?.exists) {
          errors.push({
            operation,
            message: `Cannot rename field "${operation.fieldName}" - field does not exist in ${operation.zone} zone`,
          });
        } else {
          const newFieldKey = `${operation.zone}:${operation.newFieldName}`;
          const newFieldState = fieldStates.get(newFieldKey);

          if (newFieldState?.exists) {
            errors.push({
              operation,
              message: `Cannot rename to "${operation.newFieldName}" - field already exists in ${operation.zone} zone`,
            });
          } else {
            // Mark old field as deleted and new field as added
            fieldStates.set(fieldKey, { exists: false, zone: operation.zone });
            fieldStates.set(newFieldKey, {
              exists: true,
              zone: operation.zone,
            });
          }
        }
        break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Creates operation results for reporting
 */
export function createOperationResults(
  operations: FieldOperation[],
  success: boolean = true,
  error?: string,
): OperationResult[] {
  return operations.map((operation) => ({
    operation: operation.type,
    fieldName: operation.fieldName,
    zone: operation.zone,
    success,
    error,
  }));
}