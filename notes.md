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


