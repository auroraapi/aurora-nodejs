import { Readable } from "stream";
import WAV from "../audio/wav";
import { Config } from "../config";
import { Credentials, Method } from "./backend";
import { STT_PATH } from "./backend/aurora";

/**
 * The expected response from the Aurora STT endpoint
 */
export interface STTResponse {
  transcript: string;
}

/**
 * `getSTT` uses the provided backend to query the STT service
 * with the provided audio file or stream. This function throws
 * if an error occurs.
 *
 * @param config configuration to use for the call
 * @param audio the audio to convert to text.
 */
export default async function getSTT(config: Config, audio: Readable | WAV) {
  const res = await config.backend.call({
    body: audio instanceof WAV ? audio.data() : audio,
    credentials: config as Credentials,
    method: Method.POST,
    path: STT_PATH,
  });

  return res as STTResponse;
}
