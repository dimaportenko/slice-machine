import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get the directory of this module
const __dirname = dirname(fileURLToPath(import.meta.url));

// Read package.json from the project root (two levels up from src/config/)
const packageJsonPath = join(__dirname, "../../package.json");
const packageJsonContent = readFileSync(packageJsonPath, "utf-8");
const packageJson = JSON.parse(packageJsonContent);

export const PACKAGE_INFO = {
  name: packageJson.name,
  version: packageJson.version,
  description: packageJson.description,
} as const;