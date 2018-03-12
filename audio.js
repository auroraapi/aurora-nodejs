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

module.exports = class AudioFile {
	constructor(audio) {
		// Define this.audio to be a buffer that stores the .wav file data.
		this.audio = audio;

		// An naudiodon output. This is stored so we can stop it later if need be.
		this.audioOutput = null;
	}

	// Removes the metadata from the buffer and returns the resultant buffer.
	wavWithoutMetadata() {
		return Buffer.from(this.audio.buffer, WAV_HEADER_SIZE);
	}

	// Stores the data contained in this object to [fname].wav.
	writeToFile(fname) {
		let audioReadStream = new streamBuffers.ReadableStreamBuffer();
		let endFile = fs.createWriteStream(fname + WAV_FORMAT_TAG);

		audioReadStream.pipe(endFile);

		audioReadStream.put(this.audio);
		audioReadStream.stop();
	}

	// return a stream with the audio data
	getWav() {
		return this.audio;
	}

	// write the data to wavData.wav, then return the name of the file
	getWavPath(){
		const defaultWavName = 'wavData';
		this.writeToFile(defaultWavName);
		return defaultWavName + WAV_FORMAT_TAG;
	}

	// TODO
	pad(seconds) {

	}

	// TODO
	pad_left(seconds) {

	}

	// TODO
	pad_right(seconds) {

	}

	// TODO
	trimSilent() {

	}

	// Starts the playback of the audio stored in this object.
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

	// Stops the playback of the audio.
	stop() {
		if (this.audioOutput) this.audioOutput.end();
	}

	// Starts recording data for the specified amounts of time, then returns a
	// promise with the new AudioFile as the promise result.
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
			setTimeout(function() {
				ai.quit();
				resolve(AudioFile.createFromWavData(ws.getContents()));
			}, length);
		});
	}

	// Creates an AudioFile representation from the data. No callback is needed.
	static createFromWavData(d) {
		return new AudioFile(d);
	}

	// Reads the audio data from the file, appending the .wav extension to the
	// input filename. Returns the result as a promise.
	static createFromFile(f) {
		let readFile = fs.createReadStream(f + WAV_FORMAT_TAG);
		return AudioFile.createFromStream(readFile);
	}

	// Reads the audio data from the stream. Returns a promise that will return
	// the result as the first argument.
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
