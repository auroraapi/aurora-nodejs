'use strict';

let WavBuffer = require('./wav');
let fs = require("fs");
let portAudio = require("naudiodon");
let streamBuffers = require('stream-buffers');

const BUF_SIZE = Math.pow(2, 10);
const SILENT_THRESH = Math.pow(2, 10);
const NUM_CHANNELS = 1;
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
 * uses a newly constructed WavBuffer in order to store the binary data related to the .wav file. 
 * Such files are expected to be generated using naudiodon, a node binding for PortAudio.
 *
 * @typedef {Object} AudioFile
 * @property {WavBuffer} audio
 * @property {portAudio.AudioOutput} audioOutput
 */
module.exports = class AudioFile {

	/**
	 * Creates an AudioFile object from the input WavBuffer or normal buffer.
	 * @param {WavBuffer | Buffer} audio - The buffer to be stored. 
	 */
	constructor(audio) {
		// Define this.audio to be a WavBuffer that stores the .wav file data.
		if (WavBuffer.isWavBuffer(audio)) {
			this.audio = audio;
		}
		else if (Buffer.isBuffer(audio)) {
			this.audio = new WavBuffer(audio);
		}
		else {
			throw "Input is not a buffer!";
		}

		// An naudiodon output. This is stored so we can stop it later if need be.
		this.audioOutput = null;
	}

	/**
	 * Removes .wav metadata from the buffer. 
	 * @return {Buffer} A buffer of the PCM audio data inside the wav data.
	 */
	wavWithoutMetadata() {
		return this.audio.getWavWithoutHeader();
	}

	/**
	 * A callback that takes 1 argument in case of error.
	 * @callback errorCallback
	 * @param {Error} error
	 */

	/**
	 * Stores the data contained in this object to [fname].wav. 
	 * @param {string} fname - The name of the file to write to with a '.wav' appended to the end of the input.
	 * @param {Object} [options] - Same format as fs's writeFile options.
	 * @param {errorCallback} [callback] - A callback that takes 1 argument in case there is an error. Defaults to throwing.
	 */
	writeToFile(fname, options, callback) {
		if (!options) {
			options = {
				mode: 0o666,
				flag: 'w'
			};
		}
		if (!callback) {
			callback = function(error) {
				if (error) throw error;
			};
		}
		fs.writeFile(fname + WAV_FORMAT_TAG, this.getWav(), options, callback);
	}

	/**
	 * Stores the data contained in this object to [fname].wav. 
	 * @param {string} fname - The name of the file to write to with a '.wav' appended to the end of the input.
	 * @param {Object} [options] - Same format as fs's writeFile options.
	 */
	writeToFileSync(fname, options) {
		if (!options) {
			options = {
				mode: 0o666,
				flag: 'w'
			};
		}
		fs.writeFileSync(fname + WAV_FORMAT_TAG, this.getWav(), options);
	}

	/**
	 * Return the underlying audio stream.
	 * @return {Buffer} A buffer of the PCM audio data inside the wav data.
	 */
	getWav() {
		return this.audio.getWav();
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
		this.writeToFileSync(defaultWavName);
		return defaultWavName + WAV_FORMAT_TAG;
	}

	/**
	 * Pad both sides of the audio with the specified amount of silence in seconds.
	 * @param {number} - seconds: The amount of seconds to add.
	 */
	pad(seconds) {
		this.audio.padSilence(seconds);
	}

	/**
	 * Pad the left side of the audio with the specified amount of silence in seconds.
	 * @param {number} - seconds: The amount of seconds to add.
	 */
	padLeft(seconds) {
		this.audio.padSilenceFront(seconds);
	}

	/**
	 * Pad the right side of the audio with the specified amount of silence in seconds.
	 * @param {number} - seconds: The amount of seconds to add.
	 */
	padRight(seconds) {
		this.audio.padSilenceBack(seconds);
	}

	/**
	 * Trims extraneous silence in the audio.
 	 * @param {number} [silenceThreshold] - The threshold for silence. Defaults to 1/16.
	 * @param {number} [blockSeconds] - The number of seconds to consider as a single block. Defaults to 1 second. 
	 */
	trimSilent(silenceThreshold=1/16, blockSeconds=1) {
		this.audio.trimSilence(silenceThreshold, blockSeconds);
	}

	/**
	 * Plays the audio stored in this audio file (if it exists) to the default portAudio
	 * device. The playback of the audio is asynchronous and can be stopped by calling this.stop().
	 * @return {AudioFile} - This audio file that resolves when it's done playing.
	 */
	play() {
		let currentWavBuffer = this;

		return new Promise(function(resolve, reject) {
			// If you're already playing, immediately reject.
			if (currentWavBuffer.audioOutput) {
				reject(new Error("Already playing something"));
			}

			// Load the data to be streamed.
			let readBuffer = new streamBuffers.ReadableStreamBuffer();
			readBuffer.put(currentWavBuffer.getWav());
			readBuffer.stop();

			// Create the audio output stream.
			currentWavBuffer.audioOutput = new portAudio.AudioOutput({
				channelCount: NUM_CHANNELS,
				sampleFormat: FORMAT,
				sampleRate: RATE,
				deviceId: -1 // default
			});



			// On error, stop the audio output and reject.
			let rejected = false;
			let onError = function(error) {
				console.error(error);
				rejected = true;
				reject(error);
				currentWavBuffer.audioOutput.end();
			};
			readBuffer.on('error', onError);
			currentWavBuffer.audioOutput.on('error', onError);

			// When we're done reading from the buffer, end the output.
			readBuffer.on("end", () => {
				currentWavBuffer.audioOutput.end();
			})

			// On finish, delete the audioOutput and resolve with 
			// the audio buffer if it hasn't been rejected.
			currentWavBuffer.audioOutput.on('finish', () => {
				currentWavBuffer.audioOutput = null;
				if (!rejected) {
					resolve(currentWavBuffer);
				}
			});

			// Start piping. 
			readBuffer.pipe(currentWavBuffer.audioOutput);
			currentWavBuffer.audioOutput.start();
		});
	}

	/**
	 * If audio output is being played from this.play(), stop it.
	 */
	stop() {
		if (this.audioOutput) {
			this.audioOutput.end();
			this.audioOutput = null;
		}
	}

	/**
	 * A private helper function to help set up the input and output streams.
	 * @static
	 * @param {Function} resolve - Promise handlers.
	 * @param {Function} reject - Promise handlers.
	 * @return {Object} - The resulting streams, stored at audioInput and writeStream
	 * @private
	 */
	static setUpInputAndWriteStreams(resolve, reject) {
		// Load the audio input source.
		let audioInput = new portAudio.AudioInput({
			channelCount: NUM_CHANNELS,
			sampleFormat: FORMAT,
			sampleRate: RATE,
			deviceId: -1 // default
		});

		// Load a buffer to store the input.
		let writeStream = new streamBuffers.WritableStreamBuffer();
		// Events to handle: 
		// readstream error
		// writestream error
		// readstream end
		// writestream finish
		// Start piping. 


		// On error, stop the audio output and reject.
		let rejected = false;
		let onError = function(error) {
			console.error(error);
			rejected = true;
			reject(error);
			// Triggers readstream end
			audioInput.quit();
			writeStream.end();
		};
		audioInput.on('error', onError);
		writeStream.on('error', onError);

		// When we're done reading from the mic, end the writeStream.
		audioInput.on('end', () => {
			writeStream.end();
		});

		// On finish, if you hadn't rejected the output, return a new 
		// AudioBuffer with the data in writeStream.
		writeStream.on('finish', () => {
			if (!rejected) {
				let pcmData = writeStream.getContents();
				if (!pcmData) {
					reject(new Error("Problem listening to data."));
				}
				else {
					let recordedBuffer = WavBuffer.generateWavFromPCM(pcmData, {
						numChannels: NUM_CHANNELS,
						sampleRate: RATE,
						bitsPerSample: FORMAT
					});
					resolve(AudioFile.createFromWavData(recordedBuffer));
				}
			}
		});

		return {
			audioInput: audioInput,
			writeStream: writeStream
		}
	}


	/**
	 * A private helper function to help split the task of recording, since fromRecording grew too large.
	 * @static
	 * @param {number} length - The amount of time in seconds to record for. 
	 * @return {Promise<AudioFile>} - The promise for the proper audio file from the recording. 
	 * @private
	 */
	static recordFixedLength(length = 0) {
		return new Promise(function(resolve, reject) {
			// Set up streams 
			// Implicitly sets readstream and writestream errors, readstream end, writestream finish.
			// Also implicitly resolve.
			let streams = AudioFile.setUpInputAndWriteStreams(resolve, reject);
			let audioInput = streams.audioInput;
			let writeStream = streams.writeStream;

			// Start piping.
			audioInput.start();
			audioInput.pipe(writeStream);

			// Timeout in length time.
			setTimeout(() => {
				audioInput.quit();
			}, length * 1000);
		});
	}

	/**
	 * A private helper function to help split the task of recording.
	 * @static
	 * @param {number} silenceLength - The amount of silence in seconds to allow before stopping.
	 * @return {Promise<AudioFile>} - The promise for the proper audio file from the recording. 
	 * @private
	 */
	static recordSilenceAware(silenceLen = 1.0) {
		return new Promise(function(resolve, reject) {
			// Set up streams 
			// Implicitly sets readstream and writestream errors, readstream end, writestream finish.
			// Also implicitly resolve.
			let streams = AudioFile.setUpInputAndWriteStreams(resolve, reject);
			let audioInput = streams.audioInput;
			let writeStream = streams.writeStream;

			let bytesPerSubsample = FORMAT / 8;
			let subsampleSilenceTarget = RATE * NUM_CHANNELS * silenceLen;
			let subsamplesInSilence = 0;

			// Whenever we receive a data chunk, note how long it is. Test if it is silence, 
			// then, if so, add the time corresponding to the number of samples spent in silence
			// to samplesInSilence. In either case, write to the data chunk.
			audioInput.on('data', (dataChunk) => {
				writeStream.write(dataChunk);
				
				// Loop through every subsample in the data chunk to find the one with the max amplitude.
				let numSubsamplesInChunk = dataChunk.length / bytesPerSubsample;
				let maxAmplitude = 0;
				// For each subsample in the dataChunk
				for (let currentSubsample = 0; currentSubsample < numSubsamplesInChunk; currentSubsample++) {
					// Get the current subsample
					let currentSubsampleByteOffset = currentSubsample * bytesPerSubsample;
					let currentSubsampleValue = dataChunk.readIntLE(currentSubsampleByteOffset, bytesPerSubsample);

					// Save if greater than max.
					let currentSubsampleAmplitude = Math.abs(currentSubsampleValue);
					if (currentSubsampleAmplitude > maxAmplitude) {
						maxAmplitude = currentSubsampleAmplitude;
					}
				}

				// If the maximum amplitude of the sample is greater than our silence threshold, 
				// reset the subsamples we've spent in silence. 
				if (maxAmplitude >= SILENT_THRESH) {
					console.log("Active");
					subsamplesInSilence = 0;
				}
				// Otherwise, increment the amount of silence we've encountered.
				else {
					console.log("Inactive");
					subsamplesInSilence += numSubsamplesInChunk;
				}
				// If we've spent enough time in silence, finish recording.
				if (subsamplesInSilence >= subsampleSilenceTarget) {
					audioInput.quit();
				}
			});

			// Start recording.
			audioInput.start();
		});
	}

	/**
	 * Starts recording data for the specified amount of time from the default audio device, then 
	 * returns a Promise for the actual AudioFile class. 
	 * @static
	 * @param {number} length - The amount of time in seconds to record for. If 0, it will record indefinitely, until the specified amount of silence.
	 * @param {number} silenceLength - The amount of silence in seconds to allow before stopping. Ignored if length != 0.
	 * @return {Promise<AudioFile>} - The promise for the proper audio file from the recording. 
	 */
	static fromRecording(length = 0, silenceLength = 1.0) {
		if (length != 0) {
			return AudioFile.recordFixedLength(length);
		}
		else {
			return AudioFile.recordSilenceAware(silenceLength);
		}
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
	 * Reads the .wav audio data from the stream. Returns a promise that will return
	 * the result.
	 * @static
	 * @param {Stream} readStream - A read stream.
	 * @return {Promise<AudioFile>} - A promise for an AudioFile. 
	 */
	static createFromStream(readStream) {

		// Events to handle: 
		// readstream error
		// writestream error
		// readstream end
		// writestream finish
		// Start piping. 

		return new Promise(function(resolve, reject) {

			let writeStream = new streamBuffers.WritableStreamBuffer();
			

			// On error, stop the audio output and reject.
			let rejected = false;
			let onError = function(error) {
				console.error(error);
				rejected = true;
				reject(error);
				// Triggers readstream end
				writeStream.end();
			};
			readStream.on('error', onError);
			writeStream.on('error', onError);

			// When we're done reading from the mic, end the writeStream.
			readStream.on('end', () => {
				writeStream.end();
			});

			// On finish, if you hadn't rejected the output, return a new 
			// AudioBuffer with the data in writeStream.
			writeStream.on('finish', () => {
				if (!rejected) {
					let wavData = writeStream.getContents();
					if (!pcmData) {
						reject(new Error("Problem with streaming of .wav data."));
					}
					else {
						resolve(AudioFile.createFromWavData(wavData));
					}
				}
			});

			// Start piping.
			s.pipe(ws);
		});
	}
};

// TODO: implement IsSilent(data) <--- ???
