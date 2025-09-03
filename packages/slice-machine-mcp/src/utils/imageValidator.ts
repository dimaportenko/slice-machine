/**
 * Maximum image size in bytes (128MB)
 */
export const MAX_IMAGE_SIZE = 128 * 1024 * 1024; // 128MB

/**
 * Supported image MIME types
 */
export const SUPPORTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
] as const;

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  buffer?: Buffer;
  mimeType?: string;
  size?: number;
}

/**
 * Validates and parses base64 image data
 */
export function validateAndParseImage(imageData: string): ImageValidationResult {
  try {
    // Extract the MIME type and base64 data
    const base64Match = imageData.match(/^data:(image\/\w+);base64,(.+)$/);
    
    if (!base64Match) {
      return {
        isValid: false,
        error: "Invalid image data format. Expected data URL format: data:image/type;base64,data",
      };
    }

    const [, mimeType, base64Data] = base64Match;

    // Validate MIME type
    if (!SUPPORTED_IMAGE_TYPES.includes(mimeType as any)) {
      return {
        isValid: false,
        error: `Unsupported image type: ${mimeType}. Supported types: ${SUPPORTED_IMAGE_TYPES.join(", ")}`,
      };
    }

    // Convert base64 to Buffer
    let imageBuffer: Buffer;
    try {
      imageBuffer = Buffer.from(base64Data, "base64");
    } catch (parseError) {
      return {
        isValid: false,
        error: "Invalid base64 data encoding",
      };
    }

    // Validate image size
    if (imageBuffer.length > MAX_IMAGE_SIZE) {
      const sizeMB = (imageBuffer.length / (1024 * 1024)).toFixed(2);
      const maxSizeMB = (MAX_IMAGE_SIZE / (1024 * 1024)).toFixed(0);
      return {
        isValid: false,
        error: `Image too large (${sizeMB}MB). Maximum size: ${maxSizeMB}MB`,
      };
    }

    // Basic image validation by checking magic bytes
    const isValidImage = validateImageMagicBytes(imageBuffer, mimeType);
    if (!isValidImage) {
      return {
        isValid: false,
        error: `Invalid ${mimeType} file format`,
      };
    }

    return {
      isValid: true,
      buffer: imageBuffer,
      mimeType,
      size: imageBuffer.length,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Unknown validation error",
    };
  }
}

/**
 * Validates image format by checking magic bytes
 */
function validateImageMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 4) return false;

  switch (mimeType) {
    case "image/png":
      // PNG magic bytes: 89 50 4E 47
      return (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47
      );

    case "image/jpeg":
    case "image/jpg":
      // JPEG magic bytes: FF D8
      return buffer[0] === 0xff && buffer[1] === 0xd8;

    case "image/gif":
      // GIF magic bytes: 47 49 46 38
      return (
        buffer[0] === 0x47 &&
        buffer[1] === 0x49 &&
        buffer[2] === 0x46 &&
        buffer[3] === 0x38
      );

    case "image/webp":
      // WebP magic bytes: 52 49 46 46 (RIFF) at start, 57 45 42 50 (WEBP) at offset 8
      return (
        buffer.length >= 12 &&
        buffer[0] === 0x52 &&
        buffer[1] === 0x49 &&
        buffer[2] === 0x46 &&
        buffer[3] === 0x46 &&
        buffer[8] === 0x57 &&
        buffer[9] === 0x45 &&
        buffer[10] === 0x42 &&
        buffer[11] === 0x50
      );

    default:
      return false;
  }
}

/**
 * Formats byte size to human-readable string
 */
export function formatImageSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}