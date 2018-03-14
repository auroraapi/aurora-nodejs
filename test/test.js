'use strict';

const fs = require('fs');
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;

const keys = require('./private').keys;

const aurora = require('../index');
const api = aurora.api;
const AudioFile = aurora.AudioFile;

let setKeys = function() {
	aurora.setAppId(keys['appId']);
	aurora.setAppToken(keys['appToken']);
	aurora.setDeviceId(keys['deviceId']);
}

/* test aurora API as a whole */
describe('#aurora', function() {
	it("exists", function() {
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
describe('#api', function() {
	it("exists", function() {
		expect(api).to.exist;
	});

	it("can access stored API data from headers", function() {
		const testString = "123456";
		aurora.setAppId(testString);
		aurora.setAppToken(testString);
		aurora.setDeviceId(testString);

		let headers = api.getHeaders();
		expect(headers["X-Application-ID"]).to.equal(testString);
		expect(headers["X-Application-Token"]).to.equal(testString);
		expect(headers["X-Device-ID"]).to.equal(testString);
	});

	it("converts text to speech using getTTS()", function() {
		
		setKeys();

		const wavName = './test/speechResult';
		let text = "Hello World!";

		return api.getTTS(text)
		.then((audioFile) => {
			audioFile.writeToFile(wavName);
			expect(fs.existsSync(wavName + ".wav")).to.be.true;
			fs.unlinkSync(wavName + ".wav");
		});
	});

	it("interprets text using getInterpret()", function() {
		
		setKeys();

		let text = "What's the weather in Los Angles?";

		return api.getInterpret(text)
		.then((response) => {
			expect(response.hasOwnProperty('intent')).to.be.true;
			expect(response.hasOwnProperty('entities')).to.be.true;
		});
	});

	it("can convert speech to text using getSTT()", function() {
	
		setKeys();

		return AudioFile.createFromFile("./test/helloFriends")
		.then((audioFile) => {
			return api.getSTT(audioFile);
		})
		.then((textTranscript) => {
			expect(textTranscript.transcript).to.be.a('string');
		});
	});
});


/* test audio.js */
describe('#audio', function() {
	it("exists", function() {
		expect(AudioFile).to.exist;
	});

	it("fromRecording and playback", function(done) {
		AudioFile.fromRecording(1000)
		.then(function(resultingAudioFile) {
			resultingAudioFile.play();
			done();
		});
	});


	it('converts audio data to .wav file', function(done) {
		expect(fs.existsSync('test.wav')).to.be.false;
		AudioFile.fromRecording(1000).then(function(resultingAudioFile) {
			resultingAudioFile.writeToFile('test'); // no .wav tag
			expect(fs.existsSync('test.wav')).to.be.true;

			let path = resultingAudioFile.getWavPath();
			expect(fs.existsSync(path)).to.be.true;

			// clean up
			fs.unlink('test.wav', function() {
				fs.unlink(path, function() {
					done();
				});
			});
	
		});
	});

});

/* test the Text object */
describe('#Text', function() {
	it("exists", function() {
		expect(aurora.Text).to.exist;
	});

	it("can convert Text to Speech using Text.speech()", function() {
		const wavName = './test/speechResult';

		let textObject = new aurora.Text("Hello world!");

		return textObject.speech()
		.then((speechObject) => {
			speechObject.audio.writeToFile(wavName);
			expect(fs.existsSync(wavName + ".wav")).to.be.true;
			fs.unlinkSync(wavName + ".wav");
		});
	});

	it("can convert Text to Interpret using Text.interpret()", function() {
		let textObject = new aurora.Text("What is the weather in Los Angeles?");

		return textObject.interpret()
		.then((interpretObject) => {
			expect(interpretObject.hasOwnProperty('intent')).to.be.true;
			expect(interpretObject.hasOwnProperty('entities')).to.be.true;
		});
	});
});
