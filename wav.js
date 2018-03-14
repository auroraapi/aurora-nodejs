'use strict';

/**
 * @file Provides some wrapper details for the concept of .wav data to allow metadata to be easily accessed.
 * Credit to http://soundfile.sapp.org/doc/WaveFormat/ for the information about .wav file formatting needed.
 * 
 * This file assumes little endian data and that the data chunk is the last chunk in the file.
 */

// The following constants relate to the formatting of a .wav file. Positions are their place in the buffer
// and lengths are their bytelength. 


// RIFF header
// Given positions are relative to the start of the chunk.
// .wav starts with the 4char string "RIFF".
const CHUNK_ID = "RIFF";
const CHUNK_ID_POS = 0;
const CHUNK_ID_LEN = 4;
// Stores the length of the file in bytes minutes 8.
const CHUNK_SIZE_POS = 4;
const CHUNK_SIZE_LEN = 4;
const CHUNK_SIZE_VALUE_OFFSET = 8;
// For .wav files, the rifftype is always "WAVE".
const FORMAT = "WAVE";
const FORMAT_POS = 8;
const FORMAT_LEN = 4;
// Length of the entire header for header generation purposes. 
const DEFAULT_RIFF_HEADER_POS = 0;
const DEFAULT_RIFF_HEADER_LEN = 12;


// .wav files consist of a series of subchunks, starting with a 4 char 
// id code and then 4 bytes of chunk length. 
const SUBCHUNK_ID_POS = 0;
const SUBCHUNK_ID_LEN = 4;
// Chunk length stores the length of the rest of the chunk.
const SUBCHUNK_SIZE_POS = 4;
const SUBCHUNK_SIZE_LEN = 4;
const SUBCHUNK_SIZE_VALUE_OFFSET = 8;


// "fmt " subchunk
// Given positions are relative to the start of the chunk.
// "fmt " subchunk starts with that string.
const FMT_SUBCHUNK_ID = "fmt ";
// Note: fmt subchunk size is usually 16.
const DEFAULT_FMT_SUBCHUNK_SIZE = 16;
// Audio format compression rate. If this is not 1, we can't read it.
const AUDIO_FORMAT = 1;
const AUDIO_FORMAT_POS = 8;
const AUDIO_FORMAT_LEN = 2;
// The number of channels. 1 for mono, 2 for stereo, so on.
const NUM_CHANNELS_POS = 10;
const NUM_CHANNELS_LEN = 2;
//The sample rate. Typically 44100.
const SAMPLE_RATE_POS = 12;
const SAMPLE_RATE_LEN = 4;
// == SampleRate * NumChannels * BitsPerSample/8
const BYTE_RATE_POS = 16;
const BYTE_RATE_LEN = 4;
// == NumChannels * BitsPerSample/8
const BLOCK_ALIGN_POS = 20;
const BLOCK_ALIGN_LEN = 2;
// Number of bits in a sample. 8, 16, so on.
const BITS_PER_SAMPLE_POS = 22;
const BITS_PER_SAMPLE_LEN = 2;
// Length and pos for the typical fmt subchunk for header generation purposes.
const DEFAULT_FMT_HEADER_POS = 12;
const DEFAULT_FMT_HEADER_LEN = 24;


// "data" subchunk. Contains the actual sound.
// Given positions are relative to the start of the chunk.
// Data tag.  
const DATA_SUBCHUNK_ID = "data";
// Note: Data subchunk size is usually == NumSamples * NumChannels * BitsPerSample/8
// The starting position of the data.
const DATA_START_POS = 8;
// Length and pos for the typical fmt subchunk for header generation purposes.
const DEFAULT_DATA_HEADER_POS = 36;
const DEFAULT_DATA_HEADER_LEN = 8;

// ASCII string encoding. 
const ASCII = 'ascii';


// Typical headers are around 44 bytes long. 
const DEFAULT_WAV_HEADER_LEN = 44;


// A list of various .wav audio encoding schemes.
const PCM16 = "pcm16";
const wavEncodings = [
	{
		name: PCM16,
		audioFormat: 1,
		bitsPerSample: 16
	}
];


/**
 * A class holding a buffer needed to extract meaningful data from .wav data 
 */
module.exports = class WavBuffer {
	/**
	 * Returns the string at the given position and length from
	 * the buffer in ascii format.
	 * @param {Buffer} buffer - The buffer to read from.
	 * @param {number} pos - The byte offset to read from the buffer.
	 * @param {number} length - The number of bytes to read. 
	 * @return {string} - The string at the given position.
	 * @private
	 */
	getStringFromBuffer(buffer, pos, length) {
		return buffer.toString(ASCII, pos, pos + length);
	}

	/**
	 * Returns the next 4 bytes of the buffer at the given position in
	 * the buffer in unsigned integer form.
	 * @param {Buffer} buffer - The buffer to read from.
	 * @param {number} pos - The byte offset to read from the buffer. 
	 * @return {number} - The number at the given position.
	 * @private
	 */
	getUInt32FromBuffer(buffer, pos) {
		return buffer.readUInt32LE(pos);
	}

	/**
	 * Sets the next 4 bytes of the buffer at the given position in
	 * the buffer in unsigned integer form.
	 * @param {Buffer} buffer - The buffer to read from.
	 * @param {number} value - The number to store.
	 * @param {number} pos - The byte offset to read from the buffer. 
	 * @private
	 */
	setUInt32FromBuffer(buffer, value, pos) {
		buffer.writeUInt32LE(value, pos);
	}

	/**
	 * Returns the next 2 bytes of the buffer at the given position in
	 * the buffer in unsigned integer form.
	 * @param {Buffer} buffer - The buffer to read from.
	 * @param {number} pos - The byte offset to read from the buffer. 
	 * @return {number} - The number at the given position.
	 * @private
	 */
	getUInt16FromBuffer(buffer, pos) {
		return buffer.readUInt16LE(pos);
	}

	/**
	 * Sets the next 4 bytes of the buffer at the given position in
	 * the buffer in unsigned integer form.
	 * @param {Buffer} buffer - The buffer to read from.
	 * @param {number} value - The number to store.
	 * @param {number} pos - The byte offset to read from the buffer. 
	 * @private
	 */
	setUInt16FromBuffer(buffer, value, pos) {
		buffer.writeUInt16LE(value, pos);
	}

	/**
	 * @return {number} the length of the file given by the RIFF header. This is off from the file length by CHUNK_SIZE_VALUE_OFFSET.
	 * @private
	 */
	getRiffFileLength() {
		return this.getUInt32FromBuffer(this.riffChunk, CHUNK_SIZE_POS);
	}

	/**
	 * Sets the file length to the input length. You probably shouldn't be using this.
	 * @param {number} length - The length to set the riff header to. 
	 * @private
	 */
	setRiffFileLength(length) {
		this.setUInt32FromBuffer(this.riffChunk, length, CHUNK_SIZE_POS);
	}

	/**
	 * @return {number} the length of the file given by the RIFF header.
	 * @private
	 */
	getFmtSubchunkSize() {
		return this.getUInt32FromBuffer(this.fmtChunk, SUBCHUNK_SIZE_POS);
	}

	/**
	 * Sets the file length to the input length. You probably shouldn't be using this.
	 * @param {number} length - The length to set the riff header to. 
	 * @private
	 */
	setFmtSubchunkSize(length) {
		this.setUInt32FromBuffer(this.fmtChunk, length, SUBCHUNK_SIZE_POS);
	}

	/**
	 * @return {number} the audio format number given by the header.
	 * @private
	 */
	getAudioFormat() {
		return this.getUInt16FromBuffer(this.fmtChunk, AUDIO_FORMAT_POS);
	}

	/**
	 * Set the audio format tag in the fmt header. You probably shouldn't be using this.
	 * @param {number} format - The format to set. 
	 * @private
	 */
	setAudioFormat(format) {
		this.setUInt16FromBuffer(this.fmtChunk, format, AUDIO_FORMAT_POS);
	}

	/**
	 * @return {number} the number of channels given by the header.
	 * @private
	 */
	getNumChannels() {
		return this.getUInt16FromBuffer(this.fmtChunk, NUM_CHANNELS_POS);
	}

	/**
	 * Set the number of channels tag in the fmt header. You probably shouldn't be using this.
	 * @param {number} channels - The channel count to set. 
	 * @private
	 */
	setNumChannels(channels) {
		this.setUInt16FromBuffer(this.fmtChunk, channels, NUM_CHANNELS_POS);
	}

	/**
	 * @return {number} the sample rate given by the header.
	 * @private
	 */
	getSampleRate() {
		return this.getUInt32FromBuffer(this.fmtChunk, SAMPLE_RATE_POS);
	}

	/**
	 * Set the sample rate tag in the fmt header. You probably shouldn't be using this.
	 * @param {number} rate - The sample rate. 
	 * @private
	 */
	setSampleRate(rate) {
		this.setUInt32FromBuffer(this.fmtChunk, rate, SAMPLE_RATE_POS);
	}

	/**
	 * @return {number} the byte rate given by the header.
	 * @private
	 */
	getByteRate() {
		return this.getUInt32FromBuffer(this.fmtChunk, BYTE_RATE_POS);
	}

	/**
	 * Set the byte rate tag in the fmt header. You probably shouldn't be using this.
	 * @param {number} rate - The byte rate. 
	 * @private
	 */
	setByteRate(rate) {
		this.setUInt32FromBuffer(this.fmtChunk, rate, BYTE_RATE_POS);
	}

	/**
	 * @return {number} the block align given by the header.
	 * @private
	 */
	getBlockAlign() {
		return this.getUInt16FromBuffer(this.fmtChunk, BLOCK_ALIGN_POS);
	}

	/**
	 * Set the block align tag in the fmt header. You probably shouldn't be using this.
	 * @param {number} align - The block align. 
	 * @private
	 */
	setBlockAlign(align) {
		this.setUInt16FromBuffer(this.fmtChunk, align, BLOCK_ALIGN_POS);
	}

	/**
	 * @return {number} the bits per sample given by the header.
	 * @private
	 */
	getBitsPerSample() {
		return this.getUInt16FromBuffer(this.fmtChunk, BITS_PER_SAMPLE_POS);
	}

	/**
	 * Set the bits per sample tag in the fmt header. You probably shouldn't be using this.
	 * @param {number} bps - The bits per sample. 
	 * @private
	 */
	setBitsPerSample(bps) {
		this.setUInt16FromBuffer(this.fmtChunk, bps, BITS_PER_SAMPLE_POS);
	}

	/**
	 * @return {number} the data subchunk size given by the header.
	 * @private
	 */
	getDataSubchunkSize() {
		return this.getUInt32FromBuffer(this.dataHeader, SUBCHUNK_SIZE_POS);
	}

	/**
	 * Set the data subchunk size tag in the fmt header. You probably shouldn't be using this.
	 * @param {number} size - The data subchunk size. 
	 * @private
	 */
	setDataSubchunkSize(size) {
		this.setUInt32FromBuffer(this.dataHeader, size, SUBCHUNK_SIZE_POS);
	}

	/**
	 * Updates the length fields to be consistent with the data itself. You probably shouldn't be using this.
	 * @private
	 */
	updateLengthFields() {
		this.setRiffFileLength(this.buffer.length - CHUNK_SIZE_VALUE_OFFSET);
		this.setDataSubchunkSize(this.data.length - SUBCHUNK_SIZE_VALUE_OFFSET);
	}

	/**
	 * Attempt to make the headers inside the .wav file consistent with the data itself. 
	 * You probably shouldn't be using this.
	 * @private
	 */
	attemptToFixHeaders() {
		this.updateLengthFields();
		this.setByteRate(this.getSampleRate() * this.getNumChannels() * this.getBitsPerSample() / 8);
		this.setBlockAlign(this.getNumChannels() * this.getBitsPerSample() / 8);
	}

	/**
	 * Check if the header is consistent. You probably shouldn't be using this.
	 * @return {string} - An error string if there is a problem. Otherwise, "".
	 * @private
	 */
	getHeaderConsistencyError() {
		if (this.getRiffFileLength() != (this.buffer.length - CHUNK_SIZE_VALUE_OFFSET)) {
			return "RIFF header inconsistent with data.";
		}
		if (this.getByteRate() != (this.getSampleRate() * this.getNumChannels() * this.getBitsPerSample() / 8)) {
			return "FMT byte rate inconsistent with data.";
		}
		if (this.getBlockAlign() != (this.getNumChannels() * this.getBitsPerSample() / 8)) {
			return "FMT block align inconsistent with data.";
		}
		if (this.getDataSubchunkSize() != this.data.length) {
			return "Data header inconsistent with data.";
		}
		return "";
	}

	/**
	 * Expands the underlying buffer, transfers the corresponding buffer views, and copies over
	 * data. The extra space gets added to this.data. You REALLY shouldn't be calling this.
	 * @private
	 * @param {number} byteCount - The number of bytes to expand the underlying buffer by.
	 */
	realloc(byteCount) {
		// Create new space for the buffer.
		let tempBuffer = Buffer.allocUnsafe(this.buffer.length + byteCount);
		// Copy the data.
		this.buffer.copy(tempBuffer);
		// Move DataView references.
		this.riffChunk = Buffer.from(tempBuffer.buffer, this.riffChunk.byteOffset, this.riffChunk.length);
		this.fmtChunk = Buffer.from(tempBuffer.buffer, this.fmtChunk.byteOffset, this.fmtChunk.length);
		this.dataHeader = Buffer.from(tempBuffer.buffer, this.dataHeader.byteOffset, this.dataHeader.length);
		this.data = Buffer.from(tempBuffer.buffer, this.data.byteOffset);
		// Move this.buffer pointer to the new buffer.
		this.buffer = tempBuffer;

		// Increase the various data length counts. 
		this.updateLengthFields();
	}

	/**
	 * Copies and validates the input buffer and creates a WavBuffer from it.
	 * @param {Buffer} inputBuffer - The buffer to use. 
	 * @param {boolean} [fixHeaderErrors=false] - Frequently, .wav headers will be malformed. If this is true, the constructor will attempt to fix conflicting header information. If false, errors will be thrown for malformed headers.
	 */
	constructor(inputBuffer, fixHeaderErrors=false) {
		// The central buffer holding the wave data.
		this.buffer;
		// Specific buffers point to the same locations in memory and serve to 
		// improve the readability of the code.
		this.riffChunk;
		this.fmtChunk;
		this.dataHeader;
		// This holds the start of the actual sound data with no header metadata.
		this.data;
		// A "class identifier."
		this.isAuroraWavBuffer = true;
		// Stores the encoding scheme of the data for a small performance bump.
		this.encoding;

		this.buffer = Buffer.from(inputBuffer);
 
		// Load the riff chunk
		this.riffChunk = Buffer.from(this.buffer.buffer, DEFAULT_RIFF_HEADER_POS, DEFAULT_RIFF_HEADER_LEN);
		// Validate the riff chunk
		if (this.getStringFromBuffer(this.riffChunk, CHUNK_ID_POS, CHUNK_ID_LEN) != CHUNK_ID || 
			this.getStringFromBuffer(this.riffChunk, FORMAT_POS, FORMAT_LEN) != FORMAT) {
			throw "Invalid RIFF header.";
		}

		// Store the start of the next chunk. We loop until we get through the buffer. 
		let pos = DEFAULT_RIFF_HEADER_POS + DEFAULT_RIFF_HEADER_LEN;

		while (pos < this.buffer.length) {
			let currentSubchunkID = this.getStringFromBuffer(this.buffer, pos + SUBCHUNK_ID_POS, SUBCHUNK_ID_LEN);
			let currentSubchunkLength = this.getUInt32FromBuffer(this.buffer, pos + SUBCHUNK_SIZE_POS) + SUBCHUNK_SIZE_VALUE_OFFSET;

			if (currentSubchunkID == FMT_SUBCHUNK_ID) {
				// We found a format chunk. Save it and continue processing. 
				this.fmtChunk = Buffer.from(this.buffer.buffer, pos, currentSubchunkLength);
			}
			else if (currentSubchunkID == DATA_SUBCHUNK_ID) {
				// Assume the data subchunk is the last subchunk in the file. 
				this.dataHeader = Buffer.from(this.buffer.buffer, pos, SUBCHUNK_SIZE_VALUE_OFFSET);
				// Load the actual data into the data buffer.
				let dataStart = pos + DATA_START_POS;
				this.data = Buffer.from(this.buffer.buffer, dataStart);
			}
			pos = pos + currentSubchunkLength;
		}

		if (fixHeaderErrors) {
			this.attemptToFixHeaders();
		}
		else {
			let errorString = this.getHeaderConsistencyError();
			if (errorString != "") {
				throw errorString;
			}
		}

		if (!this.isSupported()) {
			throw "The given format is currently unsupported.";
		}
	}

	/**
	 * Creates a new WavBuffer from the given input options and the PCM data in the buffer.
	 * @param {Buffer} pcmBuffer - A buffer containing the corresponding PCM data.
	 * @param {Object} options - An object containing the config options.
	 * @param {number} options.numChannels - The number of channels to record with.
	 * @param {number} options.sampleRate - The sample rate to record at.
	 * @param {number} options.bitsPerSample - Bit depth to record at. Currently should be 16.
	 * @return {WavBuffer} - A new PCM buffer from the given options.
	 */
	static generateWavFromPCM(pcmBuffer, options) {
		let tempBuffer = Buffer.allocUnsafe(pcmBuffer.length + DEFAULT_WAV_HEADER_LEN);

		// Load the RIFF header.
		Buffer.from(CHUNK_ID, ASCII).copy(tempBuffer, CHUNK_ID_POS);
		Buffer.from(FORMAT, ASCII).copy(tempBuffer, CHUNK_ID_POS + FORMAT_POS);
		
		// Load the fmt subchunk.
		Buffer.from(FMT_SUBCHUNK_ID, ASCII).copy(tempBuffer, DEFAULT_FMT_HEADER_POS);
		tempBuffer.writeUInt32LE(DEFAULT_FMT_SUBCHUNK_SIZE, DEFAULT_FMT_HEADER_POS + SUBCHUNK_SIZE_POS);
		tempBuffer.writeUInt16LE(AUDIO_FORMAT, DEFAULT_FMT_HEADER_POS + AUDIO_FORMAT_POS);
		tempBuffer.writeUInt16LE(options.numChannels, DEFAULT_FMT_HEADER_POS + NUM_CHANNELS_POS);
		tempBuffer.writeUInt32LE(options.sampleRate, DEFAULT_FMT_HEADER_POS + SAMPLE_RATE_POS);
		tempBuffer.writeUInt16LE(options.bitsPerSample, DEFAULT_FMT_HEADER_POS + BITS_PER_SAMPLE_POS);

		// Load the data header.
		Buffer.from(DATA_SUBCHUNK_ID, ASCII).copy(tempBuffer, DEFAULT_DATA_HEADER_POS);		

		// Load the pcm data into the temp buffer.
		pcmBuffer.copy(tempBuffer, DEFAULT_WAV_HEADER_LEN, DEFAULT_FMT_HEADER_POS + SUBCHUNK_SIZE_POS);

		return new WavBuffer(tempBuffer, true);
	}

	/**
	 * @returns {string} - "pcm16" if it is a PCM16 encoding. Nothing else is supported at the moment, so nothing else will be returned. 
	 */
	getWavEncodingScheme() {
		
		if (this.encoding) return this.encoding;

		for (let i = 0; i < wavEncodings.length; i++) {
			let currentWavEncoding = wavEncodings[i];
			if (this.getAudioFormat() == currentWavEncoding.audioFormat &&
				this.getBitsPerSample() == currentWavEncoding.bitsPerSample) {
				this.encoding = currentWavEncoding.name;
				return currentWavEncoding.name;
			}
		}
		return "";
	} 

	/**
	 * @returns {boolean} - true if the given format is supported. Currently, only PCM16 is supported.
	 */
	isSupported() {
		let encoding = this.getWavEncodingScheme();
		// PCM16
		if (encoding == PCM16) {
			return true;
		}
		return false;
	}

	/**
	 * Get the underlying Buffer that the wav is stored in. Keep in mind that the reference
	 * returned here might cease to be valid if the data changes. 
	 * @return {Buffer} - the underlying buffer for this object. 
	 */
	getWav() {
		return this.buffer;
	}

	/**
	 * Get the underlying buffer that the data is stored in. Keep in mind that the reference
	 * returned here might cease to be valid if the data changes. 
	 * @return {Buffer} - The underlying PCM data without the header.
	 */
	getWavWithoutHeader() {
		return this.data;
	}

	/**
	 * Returns an iterator on the data itself. Upon each call of next(), 
	 * an array of the next sample's channel values are returned. For instance, 
	 * with 2 channels, a length-2 array of the left and right channels are returned. 
	 */
	getDataIterator() {
		if (!this.isSupported()) {
			throw "The current encoding scheme is unsupported."
		}

		let blockAlign = this.getBlockAlign();
		let numChannels = this.getNumChannels();
		let bitDepth = this.getBitsPerSample();

		let sampleObtainingFunction;

		if (this.getWavEncodingScheme() == PCM16) {
			sampleObtainingFunction = (sample, channel) => {
				return sample.readInt16LE(channel * bitDepth);
			}
		}

		let dataPointer = this.data;

		let iterator = {};
		iterator[Symbol.iterator] = function () {

			let currentBlockIndex = 0;

			return {
				next: function() {
					// Finish iteration if you reach the end of the data.
					if (currentBlockIndex >= dataPointer.length) {
						return { done : true };
					}
					let currentSample = Buffer.allocUnsafe(blockAlign);
					dataPointer.copy(currentSample, 0, currentBlockIndex, currentBlockIndex + blockAlign);

					let returnValues = [];
					for (let channelCount = 0; channelCount < numChannels; channelCount++) {
						let currentChannelValue = sampleObtainingFunction(currentSample, channelCount);
						returnValues.push(currentChannelValue);
					}
					currentBlockIndex += blockAlign;
					return { value: returnValues };
				}
			};
		}

		return iterator;
	}

	/**
	 * Adds silence to the front and the back of the data.
	 * @param {number} seconds - the number of seconds to pad the front and the back with. 
	 */
	padSilence(seconds) {
		let silenceLength = seconds * this.getByteRate();
		let silence = Buffer.alloc(silenceLength);
		let previousDataLength = this.data.length;

		this.realloc(silenceLength * 2);
		this.data.copy(this.data, silenceLength);
		silence.copy(this.data);
		silence.copy(this.data, previousDataLength);
	}

	/**
	 * Adds silence to the front of the data.
	 * @param {number} seconds - the number of seconds to pad the front and the back with. 
	 */
	padSilenceFront(seconds) {
		let silenceLength = seconds * this.getByteRate();
		let silence = Buffer.alloc(silenceLength);

		this.realloc(silenceLength);
		this.data.copy(this.data, silenceLength);
		silence.copy(this.data);
	}

	/**
	 * Adds silence to the back of the data.
	 * @param {number} seconds - the number of seconds to pad the front and the back with. 
	 */
	padSilenceBack(seconds) {
		let silenceLength = seconds * this.getByteRate();
		let silence = Buffer.alloc(silenceLength);
		let previousDataLength = this.data.length;

		this.realloc(silenceLength);
		silence.copy(this.data, previousDataLength);
	}

	/**
	 * @returns {boolean} true if the object input is a WavBuffer. 
	 */
	static isWavBuffer(buffer) {
		return buffer.hasOwnProperty("isAuroraWavBuffer");
	}

	/**
	 * @returns {number} The maximum amplitude inside the data. 
	 */
	getMaxAmplitude() {
		if (!this.isSupported()) {
			throw "The current encoding scheme is unsupported."
		}

		let max = 0;
		let iterator = this.getDataIterator();
		for (let samples of iterator) {
			for (let value of samples) {
				let currentChannelAmplitude = Math.abs(value); 
				if (currentChannelAmplitude > max) {
					max = currentChannelAmplitude;
				}
			}
		}
		return max;
	}

};