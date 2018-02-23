'use strict';

let https = require('https');
https.post = require('https-post');
const fs = require('fs');
const axios = require('axios');
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

exports.getHeaders = function(){
  return {
    "X-Application-ID": store['appId'],
		"X-Application-Token": store['appToken'],
		"X-Device-ID": store['deviceId']
  }
}

// Returns a promise with the resulting audio file. 
exports.getTTS = function(text){
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
  })
  .catch((error) => {
    throw new Error(error);
  });
}


// return promise to get json from API
// TODO: Return the json
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

// Return a promise to get json from an AudioFile.
exports.getSTT = function(audio) {
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
