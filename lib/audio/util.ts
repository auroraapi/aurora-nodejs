import { Duplex, PassThrough, Readable } from "stream";
import * as WAV from "./wav";

// naudiodon doesn't support ES2016 style imports :(
const portAudio = require("naudiodon");

const SILENT_THRESH = 1 << 11;
const BUF_SIZE      = 1 << 12;

/**
 * Configurable options for recording. These are mainly used for testing
 */
const opts = {
  /** Whether or not to ignore leading silence before the actual recording */
  ignoreLeadingSilence: true,
};
export { opts };

/**
 * This function takes a buffer of 16-bit mono PCM audio data and checks
 * to see if it is "silent" -- that is, no sample is higher than the
 * silence threshold (SILENT_THRESH).
 *
 * @param buf the buffer to check for silence
 */
const isSilent = (buf: Buffer) => {
  const b = buf.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  const c = new Int16Array(buf.buffer, buf.byteOffset, b.byteLength / Int16Array.BYTES_PER_ELEMENT);
  return Math.max(...c) < SILENT_THRESH;
};

/**
 * Creates a PortAudio input stream and reads audio from it until it's closed
 * based on the parameters
 *
 * @param length seconds of audio to record
 * @param silenceLen seconds of silence to tolerate before ending recording
 */
export function record(length: number, silenceLen: number): PassThrough {
  const read = new PassThrough({
    highWaterMark: 64 * BUF_SIZE,
  });

  const stream = portAudio.AudioInput({
    channelCount: WAV.DEFAULT_NUM_CHANNELS,
    deviceId: -1, // use default device
    sampleFormat: WAV.DEFAULT_BITS_PER_SAMPLE,
    sampleRate: WAV.DEFAULT_SAMPLE_RATE,
  });

  const byteRate = (WAV.DEFAULT_SAMPLE_RATE * WAV.DEFAULT_BITS_PER_SAMPLE * WAV.DEFAULT_NUM_CHANNELS / 8.0);

  let dataLen = 0.0;
  let silence = 0.0;
  let silenceStart = opts.ignoreLeadingSilence;
  let preSilenceBufs: Buffer[] = [];

  stream.on("error", (err: Error) => {
    read.emit("error", err);
    stream.quit();
  });
  stream.on("data", (chunk: Buffer) => {
    if (silenceStart) {
      preSilenceBufs.push(chunk);
      if (preSilenceBufs.length > 1000) {
        preSilenceBufs = preSilenceBufs.slice(100);
      }
      if (!isSilent(chunk)) {
        silenceStart = false;
        read.write(Buffer.concat(preSilenceBufs));
      }
    } else {
      dataLen += chunk.byteLength;
      silence = isSilent(chunk) ? silence + chunk.byteLength : 0;

      if ((silenceLen > 0 && silence / byteRate >= silenceLen) || (length > 0 && dataLen / byteRate >= length)) {
        stream.quit();
        read.end();
        return;
      }

      read.write(chunk);
    }
  });
  stream.on("close", () => read.end());
  stream.on("end", () => read.end());
  read.on("close", () => stream.quit());

  stream.start();
  return read;
}
