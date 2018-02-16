'use strict';

let https = require('https');
https.post = require('https-post');
const store = require('./globals');

const BASE_URL = "https://api.auroraapi.com";
const TTS_URL = BASE_URL + "/v1/tts/";
const STT_URL = BASE_URL + "/v1/stt/";
const INTERPRET_URL = BASE_URL + "/v1/interpret/";

const STT_PATH = '/v1/stt/';

exports.getHeaders = function(){
  return {
    "X-Application-ID": store.appId,
		"X-Application-Token": store.appToken,
		"X-Device-ID": store.deviceId,
  }
}

exports.getTTS = function(text){
  throw Error("getTTS() not yet implemented");
}


exports.getInterpret = function(text){
  throw Error("getInterpret() not yet implemented");
}


exports.getSTT = function(audio) {
  const headers = exports.getHeaders();
  const options = {
    hostname: BASE_URL,
    port: 443,
    path: STT_PATH,
    headers: headers
  };

  const files = [
    {
      param: 'audio',
      path: audio.getWavPath(),
    }
  ];

  https.post(options, [], files, function(res) {
    return res;
  });
}

/*
def get_stt(audio):
	r = requests.post(STT_URL, files={ "audio": audio.get_wav() }, headers=get_headers())
	handle_error(r)
	return r.json()
*/