'use strict';

const fs = require('fs');
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const sleep = require('sleep');

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

  it("converts text to speech", function(done){
    this.timeout(5000);

    const wavName = 'speechResult';

    aurora.setAppId(keys['appId']);
    aurora.setAppToken(keys['appToken']);
    aurora.setDeviceId(keys['deviceId']);
    let text = new aurora.Text("hello world");

    text.speech()
    .then((speech) => {
      speech.audio.writeToFile(wavName);
      expect(fs.existsSync(wavName + ".wav")).to.be.true;
      fs.unlinkSync(wavName + ".wav");
      done();
    })
    .catch((error) => {
      assert.isNotOk(error, "Encountered text to speech error.");
      done(error);
    });

    setTimeout(()=>{}, 4000);
  });

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

  it("can convert speech to text", function(done){
    const testFile = "SSTTest2";

    aurora.setAppId(keys['appId']);
    aurora.setAppToken(keys['appToken']);
    aurora.setDeviceId(keys['deviceId']);

    let audioFilePromise = AudioFile.createFromFile(testFile);

    audioFilePromise
    .then((audioFile) => {
      return new aurora.Speech(audioFile).text();
    })
    .then((textObject) => {
      console.log("textObject.text: " + textObject.text);
      expect(textObject.text).to.be.a('string');
      done();
    })
    .catch((error) => {
      assert.isNotOk(error, "Encountered speech to text error.");
      done(error);
    });
  });
});


/* test audio.js */
describe('#audio', function(){
  it("exists", function(){
    expect(AudioFile).to.exist;
  });

  it("fromRecording and playback", function(){
    this.timeout(10000);

    AudioFile.fromRecording(3000)
    .then(function(resultingAudioFile) {
      resultingAudioFile.play();
      setTimeout(function(){},3000);
    });
  });
  
  // it("fromRecording and writeToFile", function() {
  //   this.timeout(10000);
  //   AudioFile.fromRecording(function(resultingAudioFile) {
  //     const wavName = "testFile";
  //     resultingAudioFile.writeToFile(wavName);

  //     setTimeout(function() {
  //       expect(fs.existsSync(wavName + ".wav")).to.be.true;
  //       fs.unlinkSync(wavName + ".wav");
  //       done();
  //     }, 4000);
  //   }, 5000);
  // });

});
