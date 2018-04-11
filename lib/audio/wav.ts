import { Readable } from "stream";
import { AuroraError } from "../errors";

const WAV_HEADER_LEN = 44;
const WAV_PCM_FORMAT = 16;

export const DEFAULT_NUM_CHANNELS = 1;
export const DEFAULT_SAMPLE_RATE = 16000;
export const DEFAULT_AUDIO_FORMAT = 1;
export const DEFAULT_BITS_PER_SAMPLE = 16;

/**
 * WAV implements low-level manipulation of raw PCM data. It decodes and encodes
 * WAV files and makes sure that header data stays consistent across data
 * manipulations. It is implemented according to the [WAV specification](http://soundfile.sapp.org/doc/WaveFormat/).
 *
 * @version 0.1.0
 * @author [Nikhil Kansal](https://github.com/nkansal96)
 */
export default class WAV {
  /** The raw PCM audio data */
  public audioData: Buffer;
  /** The number of channels in the audio data */
  public numChannels: number;
  /** The sample rate (frames per second, not bytes per second) */
  public sampleRate: number;
  /** The audio format (most of time it is 1, indicating PCM data) */
  public audioFormat: number;
  /** Width of each frame in bites */
  public bitsPerSample: number;

  /**
   * Create a WAV file given information about it
   *
   * @param audioData      the raw PCM waveform to be encapsulated by this file
   * @param numChannels    the number of channels in the audio data
   * @param sampleRate     the sample rate of the audio data
   * @param audioFormat    the audio format of the audio data
   * @param bitsPerSample  the frame width (bits per sample) of the audio data
   */
  constructor(audioData: Buffer = new Buffer(""),
              numChannels: number = DEFAULT_NUM_CHANNELS,
              sampleRate: number = DEFAULT_SAMPLE_RATE,
              audioFormat: number = DEFAULT_AUDIO_FORMAT,
              bitsPerSample: number = DEFAULT_BITS_PER_SAMPLE) {
    this.audioData = audioData;
    this.numChannels = numChannels;
    this.sampleRate = sampleRate;
    this.audioFormat = audioFormat;
    this.bitsPerSample = bitsPerSample;
  }

  /**
   * Decodes the given buffer into a WAV file. The buffer should be an entire
   * WAV file, including the header and raw audio data.
   *
   * @param data the WAV data to decode
   */
  public static fromBuffer(data: Buffer) {
    // find the end of the RIFF header
    let i = 4;
    while (i < data.byteLength &&
           (data[i - 4] !== "R".charCodeAt(0) ||
            data[i - 3] !== "I".charCodeAt(0) ||
            data[i - 2] !== "F".charCodeAt(0) ||
            data[i - 1] !== "F".charCodeAt(0))) { i++; }

    // if there was no header or if the data is empty, just return an empty WAV file
    const dataLen = data.byteLength - i;
    if (dataLen <= 0) {
      return new WAV();
    }

    // this is the start of the header, which is 4 bytes behind the end
    // of the RIFF header (denoted by i)
    const headOff = i - 4;

    // read data from the WAV header
    const audioFormat = data.readInt16LE(headOff + 20);
    const numChannels = data.readInt16LE(headOff + 22);
    const sampleRate = data.readInt32LE(headOff + 24);
    const bitsPerSample = data.readInt16LE(headOff + 34);
    const audioData = data.slice(headOff + 44);

    return new WAV(audioData, numChannels, sampleRate, audioFormat, bitsPerSample);
  }

  /**
   * Reads the WAV file from the stream and decodes it into a WAV object. The stream
   * should return an entire WAV file, including the RIFF header and the raw audio data.
   *
   * @param stream the stream to read the WAV file from
   */
  public static async fromStream(stream: Readable): Promise<WAV> {
    return new Promise<WAV>((resolve, reject) => {
      const bufs: Buffer[] = [];
      stream.on("data", (data: Buffer) => bufs.push(data));
      stream.on("end", () => resolve(WAV.fromBuffer(Buffer.concat(bufs))));
      stream.on("error", (err) => reject(new AuroraError("WAVBrokenStream", err.message)));
    });
  }

  /**
   * Appends the given audio data to the currently stored audio data.
   *
   * @param buf the audio data to append
   */
  public addAudioData(buf: Buffer) {
    this.audioData = Buffer.concat([this.audioData, buf]);
  }

  /**
   * Returns a fully-formated WAV file from the audio data and metadata encapsulated
   * in this object. It includes the 44-byte RIFF header followed by the raw PCM audio.
   */
  public data() {
    const chunkSize = WAV_HEADER_LEN + this.audioData.byteLength - 8;
    const byteRate = this.sampleRate * this.numChannels * this.bitsPerSample / 8;
    const blockAlign = this.numChannels * this.bitsPerSample / 8;

    // allocate buffer for the header
    const header = Buffer.alloc(WAV_HEADER_LEN);
    // write RIFF header
    header.write("RIFF", 0, 4, "ascii");
    // write total file size following this field
    header.writeInt32LE(chunkSize, 4);
    // write file format ('WAVE')
    header.write("WAVE", 8, 4, "ascii");
    // write subchunk1 ID ('fmt ')
    header.write("fmt ", 12, 4, "ascii");
    // write subchunk1 size (16 for PCM)
    header.writeInt32LE(WAV_PCM_FORMAT, 16);
    // write audio format
    header.writeInt16LE(this.audioFormat, 20);
    // write number of channels
    header.writeInt16LE(this.numChannels, 22);
    // write sample rate
    header.writeInt32LE(this.sampleRate, 24);
    // write byte rate (sample rate * num channels * bps / 8)
    header.writeInt32LE(byteRate, 28);
    // write block align (num channels * bps / 8)
    header.writeInt16LE(blockAlign, 32);
    // write bits per sample
    header.writeInt16LE(this.bitsPerSample, 34);
    // write subchunk2 id ('data')
    header.write("data", 36, 4, "ascii");
    // write subchunk2 size (lenth of the audio data)
    header.writeInt32LE(this.audioData.byteLength, 40);

    // write the actual audio data
    return Buffer.concat([header, this.audioData]);
  }
}
