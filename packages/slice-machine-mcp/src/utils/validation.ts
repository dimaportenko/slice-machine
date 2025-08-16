import { z } from "zod";
import { StateSchema } from "../schemas/slice.js";

export function validateInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown,
): { data?: T; error?: string } {
  const result = schema.safeParse(input);

  if (!result.success) {
    const errorMessages = result.error.errors
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join(", ");
    return { error: errorMessages };
  }

  return { data: result.data };
}

export function extractLocalLibraryPaths(state: unknown): string[] {
  try {
    const validationResult = StateSchema.safeParse(state);

    if (!validationResult.success) {
      console.error("State validation failed:", validationResult.error);
      return [];
    }

    return validationResult.data.libraries
      .filter((lib) => lib.isLocal)
      .map((lib) => lib.path);
  } catch (error) {
    console.error("Error extracting library paths:", error);
    return [];
  }
}
