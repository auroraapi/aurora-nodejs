'use strict';

let store = require('./globals');

const BASE_URL = "https://api.auroraapi.com";
const TTS_URL = BASE_URL + "/v1/tts/";
const STT_URL = BASE_URL + "/v1/stt/";
const INTERPRET_URL = BASE_URL + "/v1/interpret/";

exports.getHeaders = function(){
  return {
    "X-Application-ID": store.appId,
		"X-Application-Token": store.appToken,
		"X-Device-ID": store.deviceId,
  }
}
