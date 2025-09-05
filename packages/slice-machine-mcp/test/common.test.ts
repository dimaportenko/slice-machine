import { describe, it, expect } from "vitest";
import { VariationIDSchema } from "../src/schemas/common";

describe("VariationIDSchema", () => {
  describe("valid camelCase variation IDs", () => {
    it("should accept simple lowercase IDs", () => {
      expect(VariationIDSchema.parse("default")).toBe("default");
      expect(VariationIDSchema.parse("primary")).toBe("primary");
      expect(VariationIDSchema.parse("secondary")).toBe("secondary");
    });

    it("should accept camelCase IDs", () => {
      expect(VariationIDSchema.parse("variationName")).toBe("variationName");
      expect(VariationIDSchema.parse("myCustomVariant")).toBe("myCustomVariant");
      expect(VariationIDSchema.parse("heroSection")).toBe("heroSection");
      expect(VariationIDSchema.parse("callToAction")).toBe("callToAction");
    });

    it("should accept IDs with numbers", () => {
      expect(VariationIDSchema.parse("variant1")).toBe("variant1");
      expect(VariationIDSchema.parse("myVariant2")).toBe("myVariant2");
      expect(VariationIDSchema.parse("test123")).toBe("test123");
    });

    it("should accept single character IDs", () => {
      expect(VariationIDSchema.parse("a")).toBe("a");
      expect(VariationIDSchema.parse("z")).toBe("z");
    });

    it("should accept IDs with multiple uppercase letters", () => {
      expect(VariationIDSchema.parse("myHTMLVariant")).toBe("myHTMLVariant");
      expect(VariationIDSchema.parse("apiResponse")).toBe("apiResponse");
    });
  });

  describe("invalid variation IDs", () => {
    it("should reject snake_case IDs", () => {
      expect(() => VariationIDSchema.parse("variation_name")).toThrow();
      expect(() => VariationIDSchema.parse("my_custom_variant")).toThrow();
      expect(() => VariationIDSchema.parse("hero_section")).toThrow();
      expect(() => VariationIDSchema.parse("call_to_action")).toThrow();
    });

    it("should reject IDs starting with uppercase", () => {
      expect(() => VariationIDSchema.parse("Default")).toThrow();
      expect(() => VariationIDSchema.parse("VariationName")).toThrow();
      expect(() => VariationIDSchema.parse("MyCustomVariant")).toThrow();
    });

    it("should reject IDs starting with numbers", () => {
      expect(() => VariationIDSchema.parse("1variant")).toThrow();
      expect(() => VariationIDSchema.parse("123test")).toThrow();
    });

    it("should reject IDs with special characters", () => {
      expect(() => VariationIDSchema.parse("variant-name")).toThrow();
      expect(() => VariationIDSchema.parse("variant.name")).toThrow();
      expect(() => VariationIDSchema.parse("variant@name")).toThrow();
      expect(() => VariationIDSchema.parse("variant name")).toThrow();
      expect(() => VariationIDSchema.parse("variant!")).toThrow();
    });

    it("should reject empty strings", () => {
      expect(() => VariationIDSchema.parse("")).toThrow();
    });

    it("should reject IDs with underscores", () => {
      expect(() => VariationIDSchema.parse("variant_name")).toThrow();
      expect(() => VariationIDSchema.parse("my_variant")).toThrow();
      expect(() => VariationIDSchema.parse("_variant")).toThrow();
      expect(() => VariationIDSchema.parse("variant_")).toThrow();
    });

    it("should reject non-string inputs", () => {
      expect(() => VariationIDSchema.parse(123)).toThrow();
      expect(() => VariationIDSchema.parse(null)).toThrow();
      expect(() => VariationIDSchema.parse(undefined)).toThrow();
      expect(() => VariationIDSchema.parse({})).toThrow();
      expect(() => VariationIDSchema.parse([])).toThrow();
    });
  });

  describe("error messages", () => {
    it("should provide helpful error message for invalid format", () => {
      try {
        VariationIDSchema.parse("invalid_format");
      } catch (error: any) {
        expect(error.message).toContain("Variation ID must be camelCase");
        expect(error.message).toContain("e.g., default, variationName");
      }
    });
  });
});
