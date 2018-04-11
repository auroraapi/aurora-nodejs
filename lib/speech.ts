import getSTT from "./api/stt";
import { AudioFile, createRecordingStream } from "./audio";
import config from "./config";
import { Text } from "./text";

///////////////////////////////////////////////////////////////////////////////
// Default values for various listening parameters                           //
///////////////////////////////////////////////////////////////////////////////

/** The default amount of time (in seconds) to listen for; overrides silenceLen */
const DEFAULT_LISTEN_LENGTH = 0.0;
/** The default amount of time (in seconds) of silence to wait for before stopping */
const DEFAULT_SILENCE_LENGTH = 0.5;

///////////////////////////////////////////////////////////////////////////////

/**
 * The function signature for the callback passed to `continuouslyListenAndTranscribe`.
 * A function of this type is passed the detected text as well as a potential error so
 * that the developer can handle it.
 *
 * The function also controls whether or not `continuouslyListenAndTranscribe` should
 * continue to listen by returning true (to continue) or false (to stop). The function
 * can also throw and error, which will cause `continuouslyListenAndTranscribe` to
 * quit with the same error.
 *
 * @param text the text detected
 * @param err the error that might have occured
 * @returns a boolean indicating whether or not to continue processing
 */
export type TextHandler = (text: Text | null, err?: Error) => boolean;

/**
 * The function signature for the callback passed to `continuouslyListen`.
 * A function of this type is passed the detected speech as well as a potential error so
 * that the developer can handle it.
 *
 * The function also controls whether or not `continuouslyListen` should
 * continue to listen by returning true (to continue) or false (to stop). The function
 * can also throw and error, which will cause `continuouslyListen` to
 * quit with the same error.
 *
 * @param speech the speech detected
 * @param err the error that might have occured
 * @returns a boolean indicating whether or not to continue processing
 */
export type SpeechHandler = (speech: Speech | null, err?: Error) => boolean;

/**
 * Speech is a class representing some speech. It's a high level object that
 * allows you to perform API operations on speech, such as converting to
 * text.
 *
 * @version 0.0.1
 * @author [Nikhil Kansal](https://github.com/nkansal96)
 */
export class Speech {
  /**
   * The audio that is encapsulated by this Speech instance. You can access
   * it to do thing such as write it to file, get the WAV data, or play
   * the audio.
   */
  public audio: AudioFile;

  /**
   * Creates a Speech object with the given audio
   *
   * @param audio the audio file to encapsulate
   */
  constructor(audio: AudioFile) {
    this.audio = audio;
  }

  /**
   * Calls the Aurora STT API endpoint to convert the encapsulated
   * speech to text.
   */
  public async text() {
    const res = await getSTT(config, this.audio.getAudio());
    return new Text(res.transcript);
  }
}

export interface ListenParams {
  length: number;
  silenceLen: number;
}

export function createDefaultListenParams() {
  return {
    length: DEFAULT_LISTEN_LENGTH,
    silenceLen: DEFAULT_SILENCE_LENGTH,
  };
}

export async function listen(params: ListenParams = createDefaultListenParams()) {
  const audio = await AudioFile.fromRecording(params.length, params.silenceLen);
  return new Speech(audio);
}

export async function continuouslyListen(params: ListenParams, handleFn: SpeechHandler) {
  for (;;) {
    let speech = null;
    let error = null;
    try {
      speech = await listen(params);
    } catch (err) {
      error = err;
    }
    if (!handleFn(speech, error)) {
      return;
    }
  }
}

export async function listenAndTranscribe(params: ListenParams = createDefaultListenParams()) {
  const stream = createRecordingStream(params.length, params.silenceLen);
  const text = await getSTT(config, stream);
  return new Text(text.transcript);
}

export async function continuouslyListenAndTranscribe(params: ListenParams, handleFn: TextHandler) {
  for (;;) {
    let text = null;
    let error = null;
    try {
      text = await listenAndTranscribe(params);
    } catch (err) {
      error = err;
    }
    if (!handleFn(text, error)) {
      return;
    }
  }
}
