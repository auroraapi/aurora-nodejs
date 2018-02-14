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
