'use strict';

const fs = require('fs');
const expect = require('chai').expect;

const keys = require('./private').keys;

const aurora = require('../index');
const api = require('../api');
const AudioFile = require('../audio');

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

  // it("converts text to speech", function(done){
  //   this.timeout(5000);

  //   const wavName = 'speechResult.wav';

  //   aurora.setAppId(keys['appId']);
  //   aurora.setAppToken(keys['appToken']);
  //   aurora.setDeviceId(keys['deviceId']);
  //   let text = new aurora.Text("hello world");
  //   text.speech();

  //   setTimeout(function() {
  //     expect(fs.existsSync(wavName)).to.be.true;
  //     // fs.unlinkSync(wavName);
  //     done();
  //   }, 4000);
  // });

  it("interprets text", function(done){
    aurora.setAppId(keys['appId']);
    aurora.setAppToken(keys['appToken']);
    aurora.setDeviceId(keys['deviceId']);
    let text = new aurora.Text("hello");
    let resultPromise = text.interpret();

    resultPromise.then(function(response){
      expect(response.hasOwnProperty('status')).to.be.true;
      done();
    }).catch(function(error){
      done(error);
    });
  });

  // it("can convert speech to text", function(){
  //   // TODO
  //   expect(true).to.be.false; // not yet implemented
  // });
});


/ * test audio.js */
describe('#audio', function(){
  it("exists", function(){
    expect(AudioFile).to.exist;
  });

  // it("plays helloWorld.wav", function(){
  //   const audioFileName = 'helloWorld.wav';
  //   let audioFile = new audio(null);

  //   audioFile.play();
  //   expect(fs.existsSync(audioFileName)).to.be.true;
  // });

  it("records and plays back audio for 3 seconds", function(){
    this.timeout(10000);

    AudioFile.fromRecording(function(resultingAudioFile) {
      resultingAudioFile.play();
      setTimeout(function(){},3000);
    }, 3000);
  });
});
