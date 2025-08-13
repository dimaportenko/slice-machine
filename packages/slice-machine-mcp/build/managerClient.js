import { createRPCClient } from "r19/client";
import { z } from "zod";
export const createSliceMachineManagerClient = (args) => {
    return createRPCClient({
        serverURL: args.serverURL,
        fetch: args.fetch,
    });
};
export const managerClient = createSliceMachineManagerClient({
    serverURL: "http://localhost:9999/_manager",
});
// Zod schemas for validation
export const LibrarySchema = z.object({
    name: z.string(),
    path: z.string(),
    isLocal: z.boolean(),
    components: z.array(z.unknown()).optional(),
    meta: z.object({}).passthrough().optional(),
});
export const StateSchema = z.object({
    libraries: z.array(LibrarySchema).optional().default([]),
});
// DTO function to extract library paths from state
export function extractLocalLibraryPaths(state) {
    const validationResult = StateSchema.safeParse(state);
    if (!validationResult.success) {
        console.error("State validation failed:", validationResult.error);
        return [];
    }
    return validationResult.data.libraries
        .filter((lib) => lib.isLocal)
        .map((lib) => lib.path);
}
// export const getState = async (): Promise<ServerState> => {
//   const rawState = await managerClient.getState();
//   // `rawState` from the client contains non-SM-specific models. We need to
//   // transform the data to something SM recognizes.
//   const state: ServerState = {
//     ...rawState,
//     libraries: rawState.libraries.map((library) => {
//       return {
//         ...library,
//         components: library.components.map((component) => {
//           return {
//             ...component,
//             model: Slices.toSM(component.model),
//             // Replace screenshot Blobs with URLs.
//             screenshots: Object.fromEntries(
//               Object.entries(component.screenshots).map(
//                 ([variationID, screenshot]) => {
//                   return [
//                     variationID,
//                     {
//                       ...screenshot,
//                       url: URL.createObjectURL(screenshot.data),
//                     },
//                   ];
//                 },
//               ),
//             ),
//           };
//         }),
//       };
//     }),
//     customTypes: rawState.customTypes.map((customTypeModel) => {
//       return CustomTypes.toSM(customTypeModel);
//     }),
//     remoteCustomTypes: rawState.remoteCustomTypes.map(
//       (remoteCustomTypeModel) => {
//         return CustomTypes.toSM(remoteCustomTypeModel);
//       },
//     ),
//     remoteSlices: rawState.remoteSlices.map((remoteSliceModel) => {
//       return Slices.toSM(remoteSliceModel);
//     }),
//   };
//   return state;
// };
