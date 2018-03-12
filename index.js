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

/*
	Text to speech
*/
class Text {
	// Contains methods for dealing with text
	constructor(text){
		this.text = text;
	}

	// Returns a promise to get a speech object. 
	speech() {
		// Convert text to speech
		// return Speech(api.getTTS(this.text));
		return api.getTTS(this.text)
		.then((audioFile) => {
			return new Speech(audioFile);
		});
	}

	interpret() {
		// Interpret the text and return the promise
		// to get the Json
		let interpretedJsonPromise = api.getInterpret(this.text);
		return interpretedJsonPromise;
	}
}
module.exports.Text = Text;

/*
	Interpret
*/
class Interpret {
	constructor(interpretation){
		// construct an interpret object from the API response
		this.intent = interpretation.intent;
		this.entities = interpretation.entities;
	}
}
module.exports.Interpret = Interpret;

/*
	Speech to text
*/
class Speech {
	constructor(audio) {
		// Speech object gets initialized with audio
		// Audio must be of type "AudioFile" as defined in ./audio.js
		// This is returned from all methods that return audio or speech
		this.audio = audio;
	}

	// Return a promise to get a Text object.
	text() {
		return api.getSTT(this.audio)
		.then((json) => {
			return new Text(json.transcript);
		});
	}

	static continuouslyListen(length=0, silenceLength=1.0){
		// continuously listen and yield speech demarcated by
		// silent periods
		throw new Error("continuouslyListen() not yet implemented");
	}

	// Returns a promise for a Speech object from a recording.
	static listen(length=0, silenceLength=1.0){
		// listen with given parameters
		// return a speech segment
		throw new Error("listen() not yet implemented");
		// return AudioFile.fromRecording(length, silenceLength)
		// .then((audioFile) => {
		//   return new Speech(audioFile);
		// });
	}

}
module.exports.Speech = Speech;
