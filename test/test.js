'use strict';

const fs = require('fs');
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;

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
			assert.isNotOk(error, "Encountered text to speech error");
			done(error);
		});
	});

	it("interprets text", function(done){
		aurora.setAppId(keys['appId']);
		aurora.setAppToken(keys['appToken']);
		aurora.setDeviceId(keys['deviceId']);
		let text = new aurora.Text("hello");
		let resultPromise = text.interpret();

		resultPromise.then(function(response) {
			expect(response.hasOwnProperty('intent')).to.be.true;
			expect(response.hasOwnProperty('entities')).to.be.true;
			done();
		}).catch(function(error){
			assert.isNotOk(error, "Encountered interpret error");
			done(error);
		});
	});

	it("can convert speech to text", function(done){
		aurora.setAppId(keys['appId']);
		aurora.setAppToken(keys['appToken']);
		aurora.setDeviceId(keys['deviceId']);

		const textString = "Hello friends";

		let text = new aurora.Text(textString);

		text.speech()
		.then((speech) => {
			return speech.text();
		})
		.then((textObject) => {
			expect(textObject.text).to.be.a('string');
			expect(textObject.text).to.equal(textString);
			done();
		})
		.catch((error) => {
			assert.isNotOk(error, "Encountered speech to text error");
			done(error);
		});
	});
});


/* test audio.js */
describe('#audio', function(){
	it("exists", function(){
		expect(AudioFile).to.exist;
	});

	it("fromRecording and playback", function(done){
		AudioFile.fromRecording(1000)
		.then(function(resultingAudioFile) {
			resultingAudioFile.play();
			done();
		});
	});


	it('converts audio data to .wav file', function(done){
		expect(fs.existsSync('test.wav')).to.be.false;
		AudioFile.fromRecording(1000).then(function(resultingAudioFile){
			resultingAudioFile.writeToFile('test'); // no .wav tag
			expect(fs.existsSync('test.wav')).to.be.true;

			let path = resultingAudioFile.getWavPath();
			expect(fs.existsSync(path)).to.be.true;

			// clean up
			fs.unlink('test.wav', function(){
				fs.unlink(path, function(){
					done();
				});
			});
	
		});
	});

});
