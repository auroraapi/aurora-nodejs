'use strict';

let https = require('https');
https.post = require('https-post');
const fs = require('fs');
const axios = require('axios');

const BASE_URL = "https://api.auroraapi.com";
const TTS_URL = BASE_URL + "/v1/tts/";
const STT_URL = BASE_URL + "/v1/stt/";
const INTERPRET_URL = BASE_URL + "/v1/interpret/";

const TTS_PATH = '/v1/tts/';
const STT_PATH = '/v1/stt/';
const INTERPRET_PATH = '/v1/interpret/';

exports.getHeaders = function(){
  return {
    "X-Application-ID": store['appId'],
		"X-Application-Token": store['appToken'],
		"X-Device-ID": store['deviceId']
  }
}

// returns path of created .wav file
exports.getTTS = function(text){
  const outputName = 'speechResult.wav';

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
  instance.get(TTS_URL)
    .then(function(response) {
      response.data.pipe(fs.createWriteStream(outputName));
    })
    .catch(function(error){
      throw new Error(error);
  });
}


// return promise to get json from API
exports.getInterpret = function(text){
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

  return instance.get(INTERPRET_URL);
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
