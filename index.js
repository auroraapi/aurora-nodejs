'use strict';

let store = require("./globals.js");

exports.setAppId = function(id){
  store.appId = id;
}

exports.setAppToken = function(token){
  store.appToken = token;
}

exports.setDeviceId = function(id){
  store.deviceId = id;
}

exports.getAppId = () => store.appId;
exports.getAppToken = () => store.appToken;
exports.getDeviceId = () => store.deviceId;

/*
  Text to speech
*/
exports.Text = class Text {
  // Contains methods for dealing with text
  constructor(text){
    this.text = text;
  }

  speech(){
    // Convert speech to text
    // return Speech(getTTS(this.text));
    throw new Error("speech() not yet implemented");
  }

  interpret() {
    // Interpret the text and return the response
    // return Interpret(getInterpret(this.text));
    throw new Error("interpret() not yet implemented")
  }
}

/*
  Interpret
*/
exports.Interpret = class Interpret {
  constructor(interpretation){
    // construct an interpret object from the API response
    this.intent = interpretation.intent;
    this.entities = interpretation.entities;
  }
}

/*
  Speech to text
*/
exports.Speech = class Speech {
  constructor(audio) {
    // Speech object gets initialized with audio
    // Audio must be of type "AudioFile" as defined in ./audio.js
    // This is returned from all methods that return audio or speech
    this.audio = audio;
  }

  text(){
    // convert speech to text and get the prediction
    // return Text(getSTT(this.audio)["transcript"]);
    throw new Error("text() not yet implemented");
  }

  static continuouslyListen(length=0, silenceLength=1.0){
    // continuously listen and yield speech demarcated by
    // silent periods
    throw new Error("continuouslyListen() not yet implemented");
  }

  static listen(length=0, silenceLength=1.0){
    // listen with given parameters
    // return a speech segment
    throw new Error("listen() not yet implemented");
  }

}
