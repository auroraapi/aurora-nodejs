'use strict';

let fs = require("fs");
let streamBuffers = require('stream-buffers');
let portAudio = require("naudiodon");
let wav = require("wav");

const BUF_SIZE = Math.pow(2, 10);
const MAX_THRESH = Math.pow(2, 14);
const SILENT_THRESH = Math.pow(2, 10);
const NUM_CHANNELS = 2; // 1
const FORMAT = portAudio.SampleFormat16Bit;  //portAudio.paInt16;
const RATE = 44100;

const WAV_HEADER_SIZE = 44;
const WAV_FORMAT_TAG = ".wav";

/**
 * Aurora's representation for a chunk of audio. Contains methods for the basic
 * processing, playing and recording, and file management of said audio. 
 * 
 * @details
 * Since surprisingly few audio processing libraries exist for npm, this representation 
 * uses a streamable buffer in order to store the binary data related to the .wav file. 
 * Such files are expected to be generated using naudiodon, a node binding for PortAudio.
 *
 * @typedef {Object} AudioFile
 * @property {Buffer} audio
 * @property {portAudio.AudioOutput} audioOutput
 */
module.exports = class AudioFile {

	/**
	 * Creates an AudioFile object from the input stream-buffer
	 * @param {Buffer} text - The string to be stored. 
	 */
	constructor(audio) {
		// Define this.audio to be a buffer that stores the .wav file data.
		this.audio = audio;

		// An naudiodon output. This is stored so we can stop it later if need be.
		this.audioOutput = null;
	}

	/**
	 * Removes .wav metadata from the buffer. 
	 * @return {Buffer} A buffer of the PCM audio data inside the wav data.
	 */
	wavWithoutMetadata() {
		return Buffer.from(this.audio.buffer, WAV_HEADER_SIZE);
	}

	/**
	 * Stores the data contained in this object to [fname].wav. 
	 * @param {string} fname - The name of the file to write to with a '.wav' appended to the end of the input.
	 */
	writeToFile(fname) {
		let audioReadStream = new streamBuffers.ReadableStreamBuffer();
		let endFile = fs.createWriteStream(fname + WAV_FORMAT_TAG);

		audioReadStream.pipe(endFile);

		audioReadStream.put(this.audio);
		audioReadStream.stop();
	}

	/**
	 * Return the underlying audio stream.
	 * @return {Buffer} A buffer of the PCM audio data inside the wav data.
	 */
	getWav() {
		return this.audio;
	}

	/**
	 * Write the data to wavData.wav, then return the name of the file of the format:
	 * wavData.[yyyy].[MM].[dd].[hh].[mm].[fff].wav
	 * @return {string} The name of the resulting file with the '.wav' tag included.
	 */
	getWavPath() {
		let defaultWavName = 'wavData';
		let now = new Date();
		defaultWavName = defaultWavName +  
			(now.getFullYear().toString().padStart(4, '0')) + '.' +
			((now.getMonth() + 1).toString().padStart(2, '0')) + '.' +
			(now.getDate().toString().padStart(2, '0')) + '.' +
			(now.getHours().toString().padStart(2, '0')) + '.' +
			(now.getMinutes().toString().padStart(2, '0')) + '.' +
			(now.getMilliseconds().toString().padStart(3, '0'));
		this.writeToFile(defaultWavName);
		return defaultWavName + WAV_FORMAT_TAG;
	}

	/**
	 * Pad both sides of the audio with the specified amount of silence in seconds.
	 * @param {number} - seconds: The amount of seconds to add.
	 */
	pad(seconds) {
		this.padLeft(seconds);
		this.padRight(seconds);
	}

	/**
	 * Pad the left side of the audio with the specified amount of silence in seconds.
	 * @param {number} - seconds: The amount of seconds to add.
	 */
	// TODO
	padLeft(seconds) {

	}

	/**
	 * Pad the right side of the audio with the specified amount of silence in seconds.
	 * @param {number} - seconds: The amount of seconds to add.
	 */
	// TODO
	pad_right(seconds) {

	}

	/**
	 * Trims extraneous silence at the ends of the audio.
	 */
	// TODO
	// TODO
	trimSilent() {

	}

	/**
	 * Plays the audio stored in this audio file (if it exists) to the default portAudio
	 * device. The playback of the audio is asynchronous and can be stopped by calling this.stop().
	 */
	play() {
		if (this.audio) {
			this.audioOutput = new portAudio.AudioOutput({
				channelCount: NUM_CHANNELS,
				sampleFormat: FORMAT,
				sampleRate: RATE,
				deviceId: -1 // default device
			});

			this.audioOutput.on('error', err => console.error);

			// this.rs = fs.createReadStream('helloWorld.wav');
			let readableStream = new streamBuffers.ReadableStreamBuffer();
			// close output stream at end of read stream
			readableStream.on('end', () => this.audioOutput.end());

			// Trim the first WAV_HEADER_SIZE bytes to avoid playing metadata.
			readableStream.put(this.wavWithoutMetadata());
			readableStream.pipe(this.audioOutput);
			this.audioOutput.start();
		}
		else {
			console.error("Nothing to play!");
		}
	}

	/**
	 * If audio output is being played from this.play(), stop it.
	 */
	stop() {
		if (this.audioOutput) this.audioOutput.end();
	}

	/**
	 * Starts recording data for the specified amount of time from the default audio device, then 
	 * returns a Promise for the actual AudioFile class. 
	 * @static
	 * @param {number} length - The amount of time in seconds to record for. If 0, it will record indefinitely, until the specified amount of silence.
	 * @param {number} silenceLength - The amount of silence in seconds to allow before stopping. Ignored if length != 0.
	 * @return {Promise<AudioFile>} - The promise for the proper audio file from the recording. 
	 */
	static fromRecording(length = 0, silenceLen = 1.0) {
		let ai = new portAudio.AudioInput({
			channelCount: NUM_CHANNELS,
			sampleFormat: FORMAT,
			sampleRate: RATE,
			deviceId: -1 // default device
		});
		ai.on('error', err => console.error);

		// Create a wave writer that helps to encode raw audio.
		let wavWriter = new wav.Writer({
			channels: NUM_CHANNELS,
			sampleRate: RATE,
			bitDepth: FORMAT
		});

		// create write stream to write out to raw audio file
		let ws = new streamBuffers.WritableStreamBuffer();

		ai.pipe(wavWriter);
		wavWriter.pipe(ws);
		ai.start();

		return new Promise(function(resolve, reject) {
			setTimeout(() => {
				ai.quit();
				resolve(AudioFile.createFromWavData(ws.getContents()));
			}, length);
		});
	}

	/**
	 * Starts recording data for the specified amount of time from the default audio device, then 
	 * returns a Promise for the actual AudioFile class. 
	 * @static
	 * @param {Buffer} d - A buffer containing wav audio data.
	 * @return {AudioFile} - A proper audio file. No promise returned. 
	 */
	static createFromWavData(d) {
		return new AudioFile(d);
	}

	/**
	 * Reads the audio data from the file, appending the .wav extension to the
	 * input filename. Returns the result as a promise.
	 * @static
	 * @param {string} f - A filename. [filename].wav will be polled for .wav data.
	 * @return {Promise<AudioFile>} - A promise for an AudioFile. 
	 */
	static createFromFile(f) {
		let readFile = fs.createReadStream(f + WAV_FORMAT_TAG);
		return AudioFile.createFromStream(readFile);
	}

	/**
	 * Reads the audio data from the stream. Returns a promise that will return
	 * the result.
	 * @static
	 * @param {Stream} s - A pipable stream. It must contain the "end" event.
	 * @return {Promise<AudioFile>} - A promise for an AudioFile. 
	 */
	static createFromStream(s) {
		let ws = new streamBuffers.WritableStreamBuffer();
		s.pipe(ws);

		return new Promise(function(resolve, reject) {
			s.on("end", () => {
				s.close
				resolve(AudioFile.createFromWavData(ws.getContents()));
			});

			s.on("error", (error) => {
				s.close();
				reject(error);
			});
		});
	}
};

// TODO: implement IsSilent(data) <--- ???
