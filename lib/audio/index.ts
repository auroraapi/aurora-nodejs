import { AuroraError } from "../errors";
import { record } from "./util";
import { WAV } from "./wav";

import fs from "fs";
import { PassThrough, Readable } from "stream";

import * as portAudio from "node-portaudio";

export class AudioFile {
  private audio: WAV;
  private stream?: any;

  constructor(audio: WAV | Buffer) {
    if (audio instanceof WAV) {
      this.audio = audio;
    } else if (audio instanceof Buffer) {
      this.audio = WAV.fromBuffer(audio);
    } else {
      throw new AuroraError("InvalidAudioType", "Invalid audio type");
    }
  }

  public static async fromStream(stream: Readable) {
    const wav = await WAV.fromStream(stream);
    return new AudioFile(wav);
  }

  public static async fromRecording(length: number, silenceLen: number): Promise<AudioFile> {
    return new Promise<AudioFile>((resolve, reject) => {
      const stream = record(length, silenceLen);
      const bufs: Buffer[] = [];
      stream.on("data", (data: Buffer) => bufs.push(data));
      stream.on("error", reject);
      stream.on("end", () => resolve(new AudioFile(new WAV(Buffer.concat(bufs)))));
    });
  }

  public async play() {
    return new Promise((resolve, reject) => {
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
      this.stream.on("finish", resolve);

      this.stream.start();
      this.stream.write(this.audio.audioData);
      this.stream.end();
    });
  }

  public stop() {
    if (this.stream) {
      this.stream.abort();
    }
  }

  public playing() {
    return !!this.stream;
  }

  public getAudio() {
    return this.audio;
  }

  public getWAVData() {
    return this.audio.data();
  }

  public async writeToFile(fname: string) {
    return new Promise((resolve, reject) => {
      fs.writeFile(fname, this.audio.data(), (err) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  }

  public writeToFileSync(fname: string) {
    fs.writeFileSync(fname, this.audio.data(), {
      flag: "w",
      mode: 0o644,
    });
  }
}

export function createRecordingStream(length: number, silenceLen: number): PassThrough {
  const stream = new PassThrough();
  const audio = record(length, silenceLen);
  stream.write((new WAV()).data());
  audio.pipe(stream);
  return stream;
}
