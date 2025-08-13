import { createRPCClient, CreateRPCClientArgs, RPCClient } from "r19/client";
import { MANAGER_CONFIG } from "../config/constants.js";

export type CreateSliceMachineManagerClientArgs = {
  serverURL: CreateRPCClientArgs["serverURL"];
  fetch?: NonNullable<CreateRPCClientArgs["fetch"]>;
};

export function createSliceMachineManagerClient(
  args: CreateSliceMachineManagerClientArgs
): RPCClient<any> {
  return createRPCClient({
    serverURL: args.serverURL,
    fetch: args.fetch,
  });
}

// Singleton instance with default configuration
export const managerClient = createSliceMachineManagerClient({
  serverURL: MANAGER_CONFIG.serverURL,
});