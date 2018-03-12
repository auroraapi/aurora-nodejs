'use strict';

/**
 * @file Creates wrappers for the Aurora API calls and provides a promise-based framework to interact with the result. This file uses ./audio.js's AudioFile class extensively and does not deal with the high level objects in index.js
 */

const axios = require('axios');
let https = require('https');
https.post = require('https-post');

const AudioFile = require('./audio');

const BASE_URL = "https://api.auroraapi.com";
const TTS_URL = BASE_URL + "/v1/tts/";
const STT_URL = BASE_URL + "/v1/stt/";
const INTERPRET_URL = BASE_URL + "/v1/interpret/";

const TTS_PATH = '/v1/tts/';
const STT_PATH = '/v1/stt/';
const INTERPRET_PATH = '/v1/interpret/';

const CONTENT_TYPE = "Content-Type";
const WAV_MIMETYPE = "audio/wav";

module.exports.getHeaders = function() {
	return {
		"X-Application-ID": global.aurora.store['appId'],
		"X-Application-Token": global.aurora.store['appToken'],
		"X-Device-ID": global.aurora.store['deviceId']
	};
}

/**
 * Using Aurora's network API calls, converts the input text to a promise
 * for an AudioFile.
 * @param {string} text - The text to be converted into speech.
 * @return {Promise<AudioFile>} - A promise to obtain an AudioFile.
 */
module.exports.getTTS = function(text) {
	let headers = this.getHeaders();
	let instance = axios.create({
		baseURL: BASE_URL,
		timeout: 4000,
		method: 'get',
		headers: headers,
		params: {
			'text': text
		},
		responseType: 'stream',
	});

	return instance.get(TTS_URL)
	.then((httpReponse) => {
		return AudioFile.createFromStream(httpReponse.data);
	});
}

/**
 * @typedef {Object} InterpretObject
 * @property {string} text - The input text to be interpreted.
 * @property {string} intent - A one word categorization denoting the intent of the text. 
 * @property {Object} entities - An object containing other relevant properties given in key-value pairs. 
 */

/**
 * Using Aurora's network API calls, converts the input text to a promise
 * for interpretation of that text.
 * @param {string} text - The text to be interpreted.
 * @return {Promise<InterpretObject>} - A promise to obtain interpretation data.
 */
module.exports.getInterpret = function(text) {
	let headers = this.getHeaders();
	let instance = axios.create({
		baseURL: BASE_URL,
		timeout: 4000,
		method: 'get',
		headers: headers,
		params: {
			'text': text
		},
		responseType: 'json',
	});

	return instance.get(INTERPRET_URL)
	.then((httpResponse) => {
		return httpResponse.data;
	});
}

/**
 * @typedef {Object} TextTranscript
 * @property {string} transcript - A transcript of input audio.
 */

/**
 * Using Aurora's network API calls, converts the input AudioFile to a promise
 * for an AudioFile.
 * @param {AudioFile} audio - The audio to be converted into text.
 * @return {Promise<TextTranscript>} - A promise to obtain json data transcribing the data.
 */
module.exports.getSTT = function(audio) {
	let headers = this.getHeaders();
	headers[CONTENT_TYPE] = WAV_MIMETYPE;
	let instance = axios.create({
		baseURL: BASE_URL,
		timeout: 4000,
		method: 'post',
		headers: headers,
		responseType: 'json'
	});

	return instance.post(STT_URL, audio.getWav())
	.then((httpResponse) => {
		return httpResponse.data;
	});
}
