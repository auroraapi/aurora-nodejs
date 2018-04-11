import { Method, Credentials } from "./backend";
import { TTS_PATH } from "./backend/aurora";
import { Config } from "../config";
import { Map } from "../common";
import { AudioFile } from "../audio";
import WAV from "../audio/wav";
import { Readable } from "stream";

/**
 * `getTTS` uses the provided backend to query the TTS service
 * with the provided text. This function throws if an error occurs.
 * 
 * @param config configuration to use for the call
 * @param text the text to interpret
 */
export default async function getTTS(config: Config, text: string) {
	const res = await config.backend.call({
		method: Method.GET,
		path: TTS_PATH,
		query: { text },
		credentials: config as Credentials,
		responseType: 'stream',
	});

	const wav = await WAV.fromStream(res as Readable);
	return new AudioFile(wav);
}