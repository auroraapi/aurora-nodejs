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
// Length of the entire header for organizational purposes. 
const DEFAULT_RIFF_HEADER_POS = 0;
const DEFAULT_RIFF_HEADER_LEN = CHUNK_ID_LEN + CHUNK_SIZE_LEN + FORMAT_LEN;


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


// "data" subchunk. Contains the actual sound.
// Given positions are relative to the start of the chunk.
// Data tag.  
const DATA_SUBCHUNK_ID = "data";
// Note: Data subchunk size is usually == NumSamples * NumChannels * BitsPerSample/8
// The starting position of the data.
const DATA_START_POS = 8;

// ASCII string encoding. 
const ASCII = 'ascii';

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
		return this.getUInt32FromBuffer(this.dataChunk, SUBCHUNK_SIZE_POS);
	}

	/**
	 * Set the data subchunk size tag in the fmt header. You probably shouldn't be using this.
	 * @param {number} size - The data subchunk size. 
	 * @private
	 */
	setDataSubchunkSize(size) {
		this.setUInt32FromBuffer(this.dataChunk, size, SUBCHUNK_SIZE_POS);
	}

	/**
	 * Attempt to make the headers inside the .wav file consistent with the data itself. 
	 * You probably shouldn't be using this.
	 * @private
	 */
	attemptToFixHeaders() {
		this.setRiffFileLength(this.buffer.byteLength - CHUNK_SIZE_VALUE_OFFSET);
		this.setByteRate(this.getSampleRate() * this.getNumChannels() * this.getBitsPerSample() / 8);
		this.setBlockAlign(this.getNumChannels() * this.getBitsPerSample() / 8);
		this.setDataSubchunkSize(this.dataChunk.byteLength - SUBCHUNK_SIZE_VALUE_OFFSET);
	}

	/**
	 * Check if the header is consistent. You probably shouldn't be using this.
	 * @return {string} - An error string if there is a problem. Otherwise, "".
	 * @private
	 */
	getHeaderConsistencyError() {
		if (this.getRiffFileLength() != (this.buffer.byteLength - CHUNK_SIZE_VALUE_OFFSET)) {
			return "RIFF header inconsistent with data.";
		}
		if (this.getByteRate() != (this.getSampleRate() * this.getNumChannels() * this.getBitsPerSample() / 8)) {
			return "FMT byte rate inconsistent with data.";
		}
		if (this.getBlockAlign() != (this.getNumChannels() * this.getBitsPerSample() / 8)) {
			return "FMT block align inconsistent with data.";
		}
		if (this.getDataSubchunkSize() != (this.dataChunk.byteLength - SUBCHUNK_SIZE_VALUE_OFFSET)) {
			return "Data header inconsistent with data.";
		}
		return "";
	}

	/**
	 * Validates the input buffer and creates a WavBuffer from it.
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
		this.dataChunk;
		// This holds the start of the actual sound data with no header metadata.
		this.data;

		this.buffer = inputBuffer;
 
		// Load the riff chunk
		this.riffChunk = Buffer.from(this.buffer.buffer, DEFAULT_RIFF_HEADER_POS, DEFAULT_RIFF_HEADER_LEN);
		// Validate the riff chunk
		if (this.getStringFromBuffer(this.riffChunk, CHUNK_ID_POS, CHUNK_ID_LEN) != CHUNK_ID || 
			this.getStringFromBuffer(this.riffChunk, FORMAT_POS, FORMAT_LEN) != FORMAT) {
			throw "Invalid RIFF header.";
		}

		// Store the start of the next chunk. We loop until we get through the buffer. 
		let pos = DEFAULT_RIFF_HEADER_POS + DEFAULT_RIFF_HEADER_LEN;

		while (pos < this.buffer.byteLength) {
			let currentSubchunkID = this.getStringFromBuffer(this.buffer, pos + SUBCHUNK_ID_POS, SUBCHUNK_ID_LEN);
			let currentSubchunkLength = this.getUInt32FromBuffer(this.buffer, pos + SUBCHUNK_SIZE_POS) + SUBCHUNK_SIZE_VALUE_OFFSET;

			if (currentSubchunkID == FMT_SUBCHUNK_ID) {
				// We found a format chunk. Save it and continue processing. 
				this.fmtChunk = Buffer.from(this.buffer.buffer, pos, currentSubchunkLength);
			}
			else if (currentSubchunkID == DATA_SUBCHUNK_ID) {
				// Assume the data subchunk is the last subchunk in the file. 
				this.dataChunk = Buffer.from(this.buffer.buffer, pos);
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
	}
};