'use strict';

const fs = require('fs');
const expect = require('chai').expect;

const keys = require('./private').keys;

const aurora = require('../index');
const api = require('../api');
const audio = require('../audio');

/* test aurora API as a whole */
describe('#aurora', function(){
  it("exists", function(){
    expect(aurora).to.exist;
  });

  it("stores and retrieves an app ID", function() {
    const testAppId = "123456";
    aurora.setAppId(testAppId);
    expect(aurora.getAppId()).to.equal(testAppId);
  });

  it("stores and retrieves an app token", function() {
    const testAppToken = "123456";
    aurora.setAppToken(testAppToken);
    expect(aurora.getAppToken()).to.equal(testAppToken);
  });

  it("stores and retrieves a device ID", function() {
    const testDeviceID = "123456";
    aurora.setDeviceId(testDeviceID);
    expect(aurora.getDeviceId()).to.equal(testDeviceID);
  });
});


/* test api.js */
describe('#api', function(){
  it("exists", function(){
    expect(api).to.exist;
  });

  it("can access stored API data", function(){
    const testString = "123456";
    aurora.setAppId(testString);
    aurora.setAppToken(testString);
    aurora.setDeviceId(testString);

    let headers = api.getHeaders();
    expect(headers["X-Application-ID"]).to.equal(testString);
    expect(headers["X-Application-Token"]).to.equal(testString);
    expect(headers["X-Device-ID"]).to.equal(testString);
  });

  it("can convert text to speech", function(){
    aurora.setAppId(keys['appId']);
    aurora.setAppToken(keys['appToken']);
    aurora.setDeviceId(keys['deviceId']);
    let text = new aurora.Text("hello");
    let resultPath = text.speech();

    setTimeout(function() {
      expect(fs.existsSync(resultPath)).to.be.true;
      // fs.unlinkSync(audioFileName);
    }, 4000);
  });

  // it("can convert speech to text", function(){
  //   // TODO
  //   expect(true).to.be.false; // not yet implemented
  // });
});


/ * test audio.js */
describe('#audio', function(){
  it("exists", function(){
    expect(audio).to.exist;
  });
  /*

  it("records and plays back audio", function(){
    const audioFileName = 'rawAudio.wav';
    let audioFile = new audio(null);

    try {
      fs.unlinkSync(audioFileName);
    } catch(err) {
      // audio file already doesn't exist
      // just keep going
    }

    audio.fromRecording(1);
    expect(fs.existsSync(audioFileName)).to.be.true;

    try {
      fs.unlinkSync(audioFileName);
    } catch(err) {
      throw err;
    }
  });
  */
});
