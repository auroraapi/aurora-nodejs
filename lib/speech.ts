import { getSTT } from "./api/stt";
import { AudioFile, createRecordingStream } from "./audio";
import { config } from "./config";
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

/**
 * Various parameters used to configure the audio recording.
 */
export interface ListenParams {
  /**
   * The amount of time (in seconds) to record for. Specifying this overrides
   * any value set for `silenceLen`. Note that the recording function will discard
   * silence at the beginning of the recording until some non-silence, and then will
   * start recording for `length` additional seconds.
   */
  length: number;

  /**
   * The amount of time (in seconds) of silence to tolerate before ending the recording.
   * This value is only taken into account when `length` is set to 0. Note that the
   * recording function will still discard silence at the beginning of the recording
   * until some non-silence, and then will start recording until it finds `silenceLen`
   * consecutive seconds of silence.
   */
  silenceLen: number;
}

/**
 * Creates an object with the default values for the listening parameters.
 * You should use this to create the listen params and then modify the
 * parameters you want to specify.
 */
export const createDefaultListenParams = (): ListenParams => ({
  length: DEFAULT_LISTEN_LENGTH,
  silenceLen: DEFAULT_SILENCE_LENGTH,
});

/**
 * Listen on the recording device given the parameters. It resolves with
 * a Speech object encapsulating the captured audio.
 *
 * @param params the listening parameters
 */
export async function listen(params: ListenParams = createDefaultListenParams()) {
  const audio = await AudioFile.fromRecording(params.length, params.silenceLen);
  return new Speech(audio);
}

/**
 * Continuously listens on the recording device with the given parameters. It
 * passes the detected speech as the first argument to the provided callback.
 * This function does this repeatedly until the callback function returns
 * false or throws an error.
 *
 * @param params the listening params
 * @param handleFn the function that handles each incoming speech segment
 */
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

/**
 * Listen on the recording device given the parameters. Once the recording starts
 * it streams the audio to the Aurora API to immediately begin transcribing.
 *
 * This function resolves with a Text instance, containing the final transcribed
 * text.
 *
 * @param params the listening parameters
 */
export async function listenAndTranscribe(params: ListenParams = createDefaultListenParams()) {
  const stream = createRecordingStream(params.length, params.silenceLen);
  const text = await getSTT(config, stream);
  return new Text(text.transcript);
}

/**
 * Continuously listens on the recording device with the given paramters.
 * Once the recording starts it streams the audio to the Aurora API to
 * immediately begin transcribing. This function resolves with a Text
 * instance, containing the final transcribed text.
 *
 * This function does this repeatedly until the callback function returns
 * false or throws an error.
 *
 * @param params the listening params
 * @param handleFn the function that handles each incoming text segment
 */
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
