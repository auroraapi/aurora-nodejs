import { AuroraError, ErrorCode } from "../errors";
import { record } from "./util";
import { WAV } from "./wav";

import fs from "fs";
import * as portAudio from "node-portaudio";
import { PassThrough, Readable } from "stream";

/**
 * AudioFile represents an audio file. Its underlying data container is
 * a WAV file. This class provides high level functions to create WAV
 * files in memory from various sources, including a WAV object, a Buffer,
 * a Stream, or from recording. It also lets you play and save files.
 */
export class AudioFile {
  /** the WAV file encapsulated by this object */
  private audio: WAV;
  /** a reference to the node-portaudio stream that is currently playing this file */
  private stream?: any;

  /**
   * Creates an AudioFile from either a WAV object or a Buffer, which is converted
   * to a WAV object. If passing a Buffer, it needs to be a valid WAV file with
   * correct header fields.
   *
   * @param audio
   */
  constructor(audio: WAV | Buffer) {
    if (audio instanceof WAV) {
      this.audio = audio;
    } else if (audio instanceof Buffer) {
      this.audio = WAV.fromBuffer(audio);
    } else {
      throw AuroraError.fromCode(ErrorCode.InvalidAudioType);
    }
  }

  /**
   * Consumes the given stream and creates an AudioFile from it. The passed
   * stream object must contain a valid WAV file.
   *
   * @param stream the stream to consume and convert to an AudioFile
   */
  public static async fromStream(stream: Readable) {
    const wav = await WAV.fromStream(stream);
    return new AudioFile(wav);
  }

  /**
   * Records audio from the default input device, formats it as a WAV file,
   * and creates an AudioFile from it.
   *
   * @param length number of seconds to listen for (not including leading silence)
   * @param silenceLen number of seconds of silence to endure (not including leading silence)
   *                   before quitting the recording. This value is ignored if `length != 0`
   */
  public static async fromRecording(length: number, silenceLen: number): Promise<AudioFile> {
    return new Promise<AudioFile>((resolve, reject) => {
      const stream = record(length, silenceLen);
      const bufs: Buffer[] = [];
      stream.on("data", (data: Buffer) => bufs.push(data));
      stream.on("error", reject);
      stream.on("end", () => resolve(new AudioFile(new WAV(Buffer.concat(bufs)))));
    });
  }

  /**
   * Plays the song asynchronously to the default output device. If you want to
   * stop playback, you can call the `stop()` function on this object.
   */
  public play() {
    if (this.stream) {
      this.stream.abort();
    }

    // Create the audio output stream.
    this.stream = new portAudio.AudioOutput({
      channelCount: this.audio.numChannels,
      deviceId: -1, // use default device
      sampleFormat: this.audio.bitsPerSample,
      sampleRate: this.audio.sampleRate,
    });

    this.stream.on("error", () => undefined);

    this.stream.start();
    this.stream.write(this.audio.audioData);
    this.stream.end();
  }

  /**
   * Stops the playback
   */
  public stop() {
    if (this.stream) {
      this.stream.end();
      this.stream.quit();
      this.stream.abort();
    }
  }

  /**
   * @returns true if the AudioFile is currently playing.
   */
  public playing() {
    return !!this.stream;
  }

  /**
   * @returns the underlying WAV object
   */
  public getAudio() {
    return this.audio;
  }

  /**
   * @returns the fully-formatted WAV file (with correct headers) from the underlying WAV object
   */
  public getWAVData() {
    return this.audio.data();
  }

  /**
   * Writes the underlying WAV file to the given path asynchronously.
   *
   * @param path filepath to write to
   */
  public async writeToFile(path: string) {
    return new Promise((resolve, reject) => {
      fs.writeFile(path, this.audio.data(), (err) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  }

  /**
   * Writes the underlying WAV file to the given path synchronously.
   *
   * @param path filepath to write to
   */
  public writeToFileSync(path: string) {
    fs.writeFileSync(path, this.audio.data(), {
      flag: "w",
      mode: 0o644,
    });
  }
}

/**
 * Creates a stream that emits a complete WAV file by recording from the default
 * input device. The returned stream first contains the 44-byte WAV header, and then
 * is followed by 16-bit mono samples at a rate of 16 KHz. NOTE: because we emit
 * the WAV header on the stream before we find out how long the data actually is, the
 * header doesn't have the correct value for the length of the data. For this reason,
 * the consumer of the stream needs to either update the header field manually or
 * read the WAV file until EOF.
 *
 * @param length number of seconds to listen for (not including leading silence)
 * @param silenceLen number of seconds of silence to endure (not including leading silence)
 *                   before quitting the recording. This value is ignored if `length != 0`
 */
export function createRecordingStream(length: number, silenceLen: number): PassThrough {
  const stream = new PassThrough();
  const audio = record(length, silenceLen);
  stream.write((new WAV()).data());
  audio.pipe(stream);
  return stream;
}
