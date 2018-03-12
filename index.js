'use strict';

// This call adds 'aurora.store' to the global object to allow api keys 
// to be accessable throughout. 
require('./globals'); 

const api = require("./api");
const AudioFile = require('./audio');

module.exports.setAppId = (id) => global.aurora.store.appId = id;
module.exports.setAppToken = (token) => global.aurora.store.appToken = token;
module.exports.setDeviceId = (id) => global.aurora.store.deviceId = id;

module.exports.getAppId = () => global.aurora.store.appId;
module.exports.getAppToken = () => global.aurora.store.appToken;
module.exports.getDeviceId = () => global.aurora.store.deviceId;

module.exports.api = api;
module.exports.AudioFile = AudioFile;

/**
 * Aurora's text object. This high level object provides the main point of
 * interaction between your code and the API and primarily uses promises to 
 * handle the result of network calls. 
 */
class Text {
	/**
	 * Creates a Text object from the input string. 
	 * @param {string} text - The string to be stored. 
	 */
	constructor(text) {
		this.text = text;
	}

	/**
	 * Using the Aurora network API calls, converts the initialized text into a 
	 * promise for an Aurora Speech object.
	 * @return {Promise<Speech>} An Aurora Speech object.
	 */
	speech() {
		return api.getTTS(this.text)
		.then((audioFile) => {
			return new Speech(audioFile);
		});
	}

	/**
	 * Using the Aurora network API calls, converts the initialized text into a 
	 * promise for an Aurora Interpret object.
	 * @return {Promise<Interpret>} An Aurora Interpret object.
	 */
	interpret() {
		let interpretedJsonPromise = api.getInterpret(this.text)
		.then((interpretJson) => {
			return new Interpret(interpretJson);
		});
		return interpretedJsonPromise;
	}
}
module.exports.Text = Text;

/**
 * Aurora's interpretation object. This high level object provides a wrapper
 * for Aurora's interpretation data.
 */
class Interpret {
	/**
	 * Creates an Interpret object from the input data.
	 * @param {Object} interpretation - The object containing interpretation data.
	 * @param {string} interpretation.intent - A one word categorization denoting the intent of the text. 
	 * @param {Object} interpretation.entities - An object containing other relevant properties given in key-value pairs. 
	 */
	constructor(interpretation) {
		this.intent = interpretation.intent;
		this.entities = interpretation.entities;
	}
}
module.exports.Interpret = Interpret;

/**
 * Aurora's speech object. This high level object provides a wrapper
 * for an Aurora AudioFile object that contains speech audio as well as
 * listening functions for creating new Speech objects from available audio
 * equipment and conversion methods to obtain a promise for the Aurora Text
 * version of the audio. 
 */
class Speech {
	/**
	 * Creates a Speech object from the input AudioFile.
	 * @param {AudioFile} audio - A class containing Aurora audio data (as specified in ./audio.js). 
	 */
	constructor(audio) {
		this.audio = audio;
	}

	/**
	 * Using the Aurora network API calls, converts the initialized audio data
	 * into a promise for an Aurora Text object.
	 * @return {Promise<Text>} An Aurora Text object.
	 */
	text() {
		return api.getSTT(this.audio)
		.then((json) => {
			return new Text(json.transcript);
		});
	}

	/**
	 * A method of constructing a new Speech object based on audio data taken
	 * from available audio equipment. 
	 * @static
	 * @param {number} length - The amount of time in seconds to record for. If 0, it will record indefinitely, until the specified amount of silence.
	 * @param {number} silenceLength - The amount of silence in seconds to allow before stopping. Ignored if length != 0.
	 * @return {Promise<Speech>} The resulting speech object. 
	 */
	static listen(length=0, silenceLength=1.0) {
		// listen with given parameters
		// return a speech segment
		throw new Error("listen() not yet implemented");
		// return AudioFile.fromRecording(length, silenceLength)
		// .then((audioFile) => {
		//   return new Speech(audioFile);
		// });
	}

	/**
	 * Using yield syntax, continuously calls the listen function to return new Speech segments. 
	 * @static
	 * @param {number} length - The amount of time in seconds to record for. If 0, it will record indefinitely, until the specified amount of silence.
	 * @param {number} silenceLength - The amount of silence in seconds to allow before stopping. Ignored if length != 0.
	 * @return {IteratorResult<Promise<Speech>>} An iterator for promises for speech results. See MDN's yield documentation if yields are a new concept.
	 */
	static * continuouslyListen(length=0, silenceLength=1.0) {
		while (true) {
			yield Speech.listen(length, silenceLength);
		}
	}
}
module.exports.Speech = Speech;
