'use strict';

const fs = require('fs');
const expect = require('chai').expect;

/* test aurora API as a whole */
let aurora = require('../index');

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


/ * test audio.js */
let audio = require('../audio');

describe('#audio', function(){
  it("exists", function(){
    expect(audio).to.exist;
  });

  it("records audio", function(){
    let audioFile = new audio(null);
    audioFile.getWav();
    audio.fromRecording(3000);
    expect(fs.existsSync('rawAudio.raw')).to.be.true;
  });
});
