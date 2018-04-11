import { Map } from "../common";
import { Config } from "../config";
import { Credentials, Method } from "./backend";
import { INTERPRET_PATH } from "./backend/aurora";

/**
 * The expected response from the Aurora Interpret endpoint
 */
export interface InterpretResponse {
  text: string;
  intent?: string;
  entities?: Map<string>;
}

/**
 * `getInterpret` uses the provided backend to query the Interpret service
 * with the provided text. This function throws if an error occurs.
 *
 * @param config configuration to use for the call
 * @param text the text to interpret
 */
export default async function getInterpret(config: Config, text: string) {
  const res = await config.backend.call({
    credentials: config as Credentials,
    method: Method.GET,
    path: INTERPRET_PATH,
    query: { text },
  });

  return res as InterpretResponse;
}
