// scripts/create-slice.ts
import { createSliceMachineManagerClient } from "@slicemachine/manager/client";

async function main() {
  // If running the server via start-slicemachine, it’s on 9999
  const client = createSliceMachineManagerClient({
    serverURL: "http://localhost:9999/_manager",
  });

//   const libraryID = "./src/slices"; // must match `libraries` in slicemachine.config.json
  const libraryID = "./src/slices/multifamily"; // must match `libraries` in slicemachine.config.json
  const sliceName = "MyCard"; // human-readable name

  const model = {
    id: "my_card",            // snake_case ID
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
  if (errors?.length) {
    console.error("Create slice errors:", errors);
    process.exit(1);
  }

  console.log(`Slice "${model.id}" created in library ${libraryID}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});