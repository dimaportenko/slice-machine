### Dev server (Slice Machine server)

- Recommended (playground, auto-setup):

  ```bash
  # From repo root
  yarn play         # or: yarn play --new
  # Opens a project under ./playgrounds and starts:
  # - Slice Machine server on http://localhost:9999
  # - Example app (Next) on http://localhost:8001
  ```

- Manual (run against an existing app initialized with @slicemachine/init):

  ```bash
  # In your app directory (with slicemachine.config.json)
  yarn slicemachine   # serves http://localhost:9999
  ```

Notes
- In development, the server proxies the UI from http://localhost:3000. If you see proxy ECONNREFUSED, start the UI (see below) or run the server in production mode to serve a static UI.


### Dev UI (Slice Machine UI at port 3000)

```bash
# From repo root
yarn workspace slice-machine-ui dev   # serves http://localhost:3000
```


### Create a slice programmatically

1) Ensure the Slice Machine server is running and reachable at http://localhost:9999.

2) Use the script (example) and run it with tsx:

```ts
// scripts/create-slice.ts
import { createSliceMachineManagerClient } from "@slicemachine/manager/client";

async function main() {
  const client = createSliceMachineManagerClient({
    serverURL: "http://localhost:9999/_manager",
  });

  const libraryID = "./src/slices"; // must match `libraries` in slicemachine.config.json
  const sliceName = "MyCard";

  const model = {
    id: "my_card",
    type: "SharedSlice" as const,
    name: sliceName,
    description: sliceName,
    variations: [
      {
        id: "default",
        name: "Default",
        description: "Default",
        docURL: "...",
        version: "initial",
        imageUrl: "",
        primary: {},
        items: {},
      },
    ],
  };

  const { errors } = await client.slices.createSlice({ libraryID, model });
  if (errors?.length) throw new Error(JSON.stringify(errors));

  console.log(`Slice "${model.id}" created in library ${libraryID}`);
}

main();
```

Run it:

```bash
node --loader tsx scripts/create-slice.ts
# or
npx tsx scripts/create-slice.ts
```

### MCP Server (AI Assistant Integration)

The Slice Machine MCP server enables AI assistants like Claude to manage slices programmatically through a Model Context Protocol interface.

#### Setup

1. **Start the Slice Machine server** (required for MCP server to work):
   ```bash
   # From repo root
   yarn play
   # or in your app directory:
   yarn slicemachine
   ```
   This serves the Slice Machine server on http://localhost:9999

2. **Build the MCP server**:
   ```bash
   # From packages/slice-machine-mcp/
   npm run build
   ```

3. **Run the MCP server**:
   ```bash
   npm start
   # or for development:
   npm run dev
   ```

4. **Test with MCP Inspector**:
   ```bash
   npm run inspect
   # Opens inspector at http://127.0.0.1:6274
   ```

#### Available MCP Tools

- **`createSlice`** - Create new slices with multiple variations
- **`addFieldToSlice`** - Add fields to specific slice variations  
- **`deleteFieldFromSlice`** - Remove fields from slice variations
- **`updateSlice`** - Batch field operations (add, update, delete, rename)
- **`addVariantToSlice`** - Add new variants by copying existing ones

#### Programmatic Usage Examples

##### Add a variant programmatically
```typescript
// Via MCP client or AI assistant
{
  "tool": "addVariantToSlice",
  "parameters": {
    "libraryID": "./src/slices",
    "sliceID": "hero_section", 
    "variantID": "withVideo",
    "variantName": "With Video Background",
    "sourceVariantID": "default"
  }
}
```

##### Add field to specific variation
```typescript
{
  "tool": "addFieldToSlice",
  "parameters": {
    "libraryID": "./src/slices",
    "sliceID": "hero_section",
    "variationID": "withVideo", 
    "zone": "primary",
    "fieldName": "video_url",
    "fieldType": "Link",
    "fieldLabel": "Video URL"
  }
}
```

##### Batch field operations
```typescript
{
  "tool": "updateSlice", 
  "parameters": {
    "libraryID": "./src/slices",
    "sliceID": "card_list",
    "variationID": "grid",
    "operations": [
      {
        "type": "add",
        "zone": "primary",
        "fieldName": "grid_columns", 
        "fieldType": "Number",
        "fieldLabel": "Number of Columns"
      },
      {
        "type": "update",
        "zone": "items",
        "fieldName": "card_image",
        "newFieldLabel": "Card Thumbnail"
      }
    ],
    "transactional": true
  }
}
```

#### Integration with Development Workflow

1. **Start Slice Machine server** (`yarn play` or `yarn slicemachine`)
2. **Use MCP tools** to create/modify slices via AI assistant 
3. **Refresh UI** in browser to see changes
4. **Continue development** with generated slice files

The MCP server connects to the same Slice Machine Manager API (port 9999) that the UI uses, ensuring consistency between manual and programmatic slice management.


