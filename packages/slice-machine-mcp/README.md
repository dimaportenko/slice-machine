# Slice Machine MCP Server

A Model Context Protocol (MCP) server for Prismic Slice Machine, enabling AI assistants to interact with your Slice Machine project programmatically.

## Overview

This MCP server provides tools and resources for managing Prismic slices through AI assistants like Claude. It integrates with the Slice Machine Manager to create slices, query libraries, and manage your content model.

## Features

### Tools

#### `createSlice`
Create new Prismic slices with custom field configurations.

**Parameters:**
- `libraryID` (string, required): Library path (e.g., `./src/slices`)
- `sliceName` (string, required): Human-readable name for the slice
- `sliceID` (string, required): Snake_case identifier (e.g., `hero_section`)
- `description` (string, optional): Description of the slice
- `fields` (object, optional): Field configurations
  - `primary`: Array of field definitions for the primary zone
  - `items`: Array of field definitions for the repeater zone

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

3. Configure your AI assistant to use this MCP server.

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
│   └── createSlice.ts
├── resources/         # MCP resource implementations
│   └── libraries.ts
├── schemas/           # Zod validation schemas
│   ├── field.ts
│   └── slice.ts
├── services/          # External service clients
│   └── managerClient.ts
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
    ├── fieldBuilder.ts
    └── validation.ts
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

### Creating a Hero Slice

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