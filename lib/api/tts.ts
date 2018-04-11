import { Readable } from "stream";
import { AudioFile } from "../audio";
import WAV from "../audio/wav";
import { Map } from "../common";
import { Config } from "../config";
import { Credentials, Method } from "./backend";
import { TTS_PATH } from "./backend/aurora";

/**
 * `getTTS` uses the provided backend to query the TTS service
 * with the provided text. This function throws if an error occurs.
 *
 * @param config configuration to use for the call
 * @param text the text to interpret
 */
export default async function getTTS(config: Config, text: string) {
  const res = await config.backend.call({
    credentials: config as Credentials,
    method: Method.GET,
    path: TTS_PATH,
    query: { text },
    responseType: "stream",
  });

  const wav = await WAV.fromStream(res as Readable);
  return new AudioFile(wav);
}
