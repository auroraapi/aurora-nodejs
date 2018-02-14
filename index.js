'use strict';

const BASE_URL = "https://api.auroraapi.com";
const TTS_URL = BASE_URL + "/v1/tts/";
const STT_URL = BASE_URL + "/v1/stt/";
const INTERPRET_URL = BASE_URL + "/v1/interpret/";

const store  = {
  appId: null,
  appToken: null,
  deviceId: null
};


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
  exports.Text = class Text {
    constructor() {

    }
  }

  exports.Interpret = class Interpret {
    constructor() {

    }
  }

  exports.Speech = class Speech {
    constructor() {

    }
  }
*/
