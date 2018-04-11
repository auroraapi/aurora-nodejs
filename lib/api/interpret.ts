import { Method, Credentials } from "./backend";
import { INTERPRET_PATH } from "./backend/aurora";
import { Config } from "../config";
import { Map } from "../common";

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
		method: Method.GET,
		path: INTERPRET_PATH,
		query: { text },
		credentials: config as Credentials,
	});

	return res as InterpretResponse;
}