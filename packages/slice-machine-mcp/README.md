# Slice Machine MCP Server

A Model Context Protocol (MCP) server for Prismic Slice Machine, enabling AI assistants to interact with your Slice Machine project programmatically.

## Overview

This MCP server provides tools and resources for managing Prismic slices through AI assistants like Claude. It integrates with the Slice Machine Manager to create slices, query libraries, and manage your content model.

## Features

### Tools

#### `createSlice`
Create new Prismic slices with custom field configurations and multiple variations.

**Parameters:**
- `libraryID` (string, required): Library path (e.g., `./src/slices`)
- `sliceName` (string, required): Human-readable name for the slice
- `sliceID` (string, required): Snake_case identifier (e.g., `hero_section`)
- `description` (string, optional): Description of the slice
- `fields` (object, optional): Field configurations for default variation
  - `primary`: Array of field definitions for the primary zone
  - `items`: Array of field definitions for the repeater zone
- `variations` (array, optional): Array of variations to create (if not provided, only 'default' variation will be created)

#### `addFieldToSlice`
Add a new field to an existing Prismic slice in a specific zone and variation.

**Parameters:**
- `libraryID` (string, required): Library path (e.g., `./src/slices`)
- `sliceID` (string, required): Snake_case slice ID
- `variationID` (string, optional): Variation ID to add field to (defaults to 'default')
- `zone` (enum, required): Zone where to add the field ('primary' or 'items')
- `fieldName` (string, required): Field identifier in snake_case
- `fieldType` (enum, required): Type of field to add
- `fieldLabel` (string, optional): Human-readable field label
- `fieldPlaceholder` (string, optional): Placeholder text for the field
- `fieldConfig` (object, optional): Additional field-specific configuration

#### `deleteFieldFromSlice`
Delete an existing field from a Prismic slice in a specific zone and variation.

**Parameters:**
- `libraryID` (string, required): Library path (e.g., `./src/slices`)
- `sliceID` (string, required): Snake_case slice ID
- `variationID` (string, optional): Variation ID to delete field from (defaults to 'default')
- `zone` (enum, required): Zone where to delete the field ('primary' or 'items')
- `fieldName` (string, required): Field identifier to delete

#### `updateSlice`
Perform multiple field operations (add, update, delete, rename) on a Prismic slice variation in a single transaction.

**Parameters:**
- `libraryID` (string, required): Library path (e.g., `./src/slices`)
- `sliceID` (string, required): Snake_case slice ID
- `variationID` (string, optional): Variation ID to update (defaults to 'default')
- `operations` (array, required): Array of field operations to perform
- `transactional` (boolean, optional): If true, all operations succeed or all fail (default: true)

**Operation Types:**
- `add`: Add a new field
- `update`: Update existing field properties
- `delete`: Delete a field
- `rename`: Rename a field

#### `addVariantToSlice`
Add a new variant to an existing Prismic slice by copying from an existing variant.

**Parameters:**
- `libraryID` (string, required): Library path (e.g., `./src/slices`)
- `sliceID` (string, required): Snake_case slice ID
- `variantID` (string, required): New variant ID (camelCase, e.g., 'withBackground')
- `variantName` (string, required): Human-readable variant name (e.g., 'With Background')
- `sourceVariantID` (string, optional): Source variant ID to copy from (defaults to 'default')

**Field Definition:**
```json
{
  "name": "title",
  "type": "StructuredText",
  "label": "Title Field",
  "placeholder": "Enter title..."
}
```

**Supported Field Types:**
- `Text` - Simple text field
- `StructuredText` - Rich text editor
- `Image` - Image upload field
- `Link` - Link selector
- `Boolean` - Checkbox field
- `Number` - Numeric input
- `Select` - Dropdown selector
- `Date` - Date picker
- `Color` - Color picker
- `GeoPoint` - Geographic coordinates
- `Embed` - Embed field for external content

### Resources

#### `libraries`
Returns a list of available slice library paths in your project.

**URI:** `slice-machine://libraries`

## Installation

1. Ensure Slice Machine is running on port 9999:
```bash
npm run start-slicemachine
```

2. Build the MCP server:
```bash
npm run build
```

3. Global install the MCP server:
```bash
npm install -g .
```

4. Configure your AI assistant to use this MCP server.

### Claude Desktop Configuration

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "slice-machine": {
      "command": "node",
      "args": ["/path/to/slice-machine/packages/slice-machine-mcp/build/index.js"]
    }
  }
}
```

## Development

### Project Structure

```
src/
├── index.ts           # Entry point
├── server.ts          # Main server setup
├── config/            # Configuration constants
├── tools/             # MCP tool implementations
│   ├── createSlice.ts
│   ├── addFieldToSlice.ts
│   ├── deleteFieldFromSlice.ts
│   ├── updateSlice.ts
│   ├── addVariantToSlice.ts
│   └── updateSliceScreenshot.ts
├── resources/         # MCP resource implementations
│   └── libraries.ts
├── schemas/           # Zod validation schemas
│   ├── common.ts      # Shared schemas (SliceID, VariationID)
│   ├── field.ts
│   ├── slice.ts
│   ├── addField.ts
│   ├── deleteField.ts
│   ├── updateSlice.ts
│   ├── addVariant.ts
│   └── screenshot.ts
├── services/          # External service clients
│   └── managerClient.ts
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
    ├── fieldBuilder.ts
    ├── validation.ts
    └── operationValidator.ts
```

### Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Run in development mode with hot reload
- `npm run inspect` - Launch MCP inspector for testing
- `npm run types` - Type check without emitting

### Testing with Inspector

```bash
npm run inspect
```

This will start the MCP inspector at http://127.0.0.1:6274 for testing tools and resources.

## Example Usage

### Creating a Hero Slice with Multiple Variations

```javascript
// Using the createSlice tool with multiple variations
{
  "libraryID": "./src/slices",
  "sliceName": "Hero Section",
  "sliceID": "hero_section",
  "description": "A hero section with multiple layout variations",
  "variations": [
    {
      "id": "default",
      "name": "Default",
      "description": "Standard hero layout",
      "fields": {
        "primary": [
          {
            "name": "title",
            "type": "StructuredText",
            "label": "Hero Title"
          },
          {
            "name": "description",
            "type": "StructuredText",
            "label": "Hero Description"
          }
        ]
      }
    },
    {
      "id": "withBackground",
      "name": "With Background",
      "description": "Hero with background image",
      "fields": {
        "primary": [
          {
            "name": "title",
            "type": "StructuredText",
            "label": "Hero Title"
          },
          {
            "name": "description",
            "type": "StructuredText",
            "label": "Hero Description"
          },
          {
            "name": "backgroundImage",
            "type": "Image",
            "label": "Background Image"
          }
        ]
      }
    }
  ]
}
```

### Creating a Simple Hero Slice

```javascript
// Using the createSlice tool
{
  "libraryID": "./src/slices",
  "sliceName": "Hero Section",
  "sliceID": "hero_section",
  "description": "A hero section with title, description, and image",
  "fields": {
    "primary": [
      {
        "name": "title",
        "type": "StructuredText",
        "label": "Hero Title"
      },
      {
        "name": "description",
        "type": "StructuredText",
        "label": "Hero Description"
      },
      {
        "name": "backgroundImage",
        "type": "Image",
        "label": "Background Image"
      },
      {
        "name": "ctaLink",
        "type": "Link",
        "label": "Call to Action"
      }
    ]
  }
}
```

### Creating a Card List Slice

```javascript
{
  "libraryID": "./src/slices",
  "sliceName": "Card List",
  "sliceID": "card_list",
  "description": "A list of cards with repeatable items",
  "fields": {
    "primary": [
      {
        "name": "sectionTitle",
        "type": "Text",
        "label": "Section Title"
      }
    ],
    "items": [
      {
        "name": "cardTitle",
        "type": "Text",
        "label": "Card Title"
      },
      {
        "name": "cardDescription",
        "type": "StructuredText",
        "label": "Card Description"
      },
      {
        "name": "cardImage",
        "type": "Image",
        "label": "Card Image"
      }
    ]
  }
}
```

### Adding Fields to Existing Slices

```javascript
// Add a new field to a specific variation
{
  "libraryID": "./src/slices",
  "sliceID": "hero_section",
  "variationID": "withBackground",
  "zone": "primary",
  "fieldName": "cta_button",
  "fieldType": "Link",
  "fieldLabel": "Call to Action Button",
  "fieldPlaceholder": "Add your CTA link..."
}
```

### Adding New Variants

```javascript
// Add a new variant by copying from existing one
{
  "libraryID": "./src/slices",
  "sliceID": "hero_section",
  "variantID": "withVideo",
  "variantName": "With Video Background",
  "sourceVariantID": "withBackground"
}
```

### Batch Field Operations

```javascript
// Perform multiple operations in a single transaction
{
  "libraryID": "./src/slices",
  "sliceID": "hero_section",
  "variationID": "default",
  "operations": [
    {
      "type": "add",
      "zone": "primary",
      "fieldName": "subtitle",
      "fieldType": "Text",
      "fieldLabel": "Subtitle"
    },
    {
      "type": "update",
      "zone": "primary", 
      "fieldName": "title",
      "newFieldLabel": "Main Title"
    },
    {
      "type": "rename",
      "zone": "primary",
      "fieldName": "description",
      "newFieldName": "content"
    }
  ],
  "transactional": true
}
```

### Working with Variations

All field management tools support the optional `variationID` parameter:

```javascript
// Add field to specific variation
{
  "libraryID": "./src/slices",
  "sliceID": "card_list",
  "variationID": "grid",  // Instead of default
  "zone": "primary",
  "fieldName": "columns",
  "fieldType": "Select"
}

// Delete field from specific variation  
{
  "libraryID": "./src/slices",
  "sliceID": "card_list", 
  "variationID": "carousel",
  "zone": "items",
  "fieldName": "outdated_field"
}
```

## Requirements

- Node.js >= 18.0.0
- Slice Machine running on port 9999
- Valid Prismic project with `slicemachine.config.json`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the existing patterns
4. Test with the MCP inspector
5. Submit a pull request

## License

Apache-2.0