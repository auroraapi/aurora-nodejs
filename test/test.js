'use strict';

const fs = require('fs');
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;

const keys = require('./private').keys;

const aurora = require('../index');
const api = aurora.api;
const AudioFile = aurora.AudioFile;

const HELLO_FRIENDS_LOCATION = "./test/helloFriends";
const SIN_WAVE_LOCATION = "./test/sinWave";

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
	}).timeout(5000);

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
	}).timeout(5000);

	it("interprets text using getInterpret()", function() {
		
		setKeys();

		let text = "What's the weather in Los Angles?";

		return api.getInterpret(text)
		.then((response) => {
			expect(response.hasOwnProperty('intent')).to.be.true;
			expect(response.hasOwnProperty('entities')).to.be.true;
		});
	}).timeout(5000);

	it("can convert speech to text using getSTT()", function() {
	
		setKeys();

		return AudioFile.createFromFile(HELLO_FRIENDS_LOCATION)
		.then((audioFile) => {
			return api.getSTT(audioFile);
		})
		.then((textTranscript) => {
			expect(textTranscript.transcript).to.be.a('string');
		});
	}).timeout(5000);
});


/* test audio.js */
describe('#audio', function() {
	it("exists", function() {
		expect(AudioFile).to.exist;
	});

	it("can be created from a stream", function() {
		let fileName = HELLO_FRIENDS_LOCATION + ".wav";
		AudioFile.createFromStream(fs.createReadStream(fileName))
		.then(function(resultingAudioFile) {
			expect(resultingAudioFile).to.exist;
		});
	});

	it("can be created from a filename", function() {
		AudioFile.createFromFile(HELLO_FRIENDS_LOCATION)
		.then(function(resultingAudioFile) {
			expect(resultingAudioFile).to.exist;
		});
	});

	it("can be created from wav data", function() {
		let wavBuffer = fs.readFileSync(HELLO_FRIENDS_LOCATION + '.wav');
		expect(AudioFile.createFromWavData(wavBuffer)).to.exist;
	});

	it("can be created from recording a fixed length", function() {
		return AudioFile.fromRecording(3)
		.then((resultingAudioFile) => {
			expect(resultingAudioFile).to.exist;
			return resultingAudioFile.play();
		});
	}).timeout(10000);

	it("can be created from silence aware recording", function() {
		return AudioFile.fromRecording(0, 3)
		.then((resultingAudioFile) => {
			expect(resultingAudioFile).to.exist;
			return resultingAudioFile.play();
		});
	}).timeout(10000);

	it("can play and stop recordings", function() {
		return AudioFile.createFromFile(HELLO_FRIENDS_LOCATION)
		.then((audioFile) => {
			audioFile.play();
			return audioFile;
		})
		.then((audioFile) => {
			// Set a timeout for a second.
			return new Promise(function(resolve) {
				setTimeout(() => {
					resolve(audioFile);
				}, 1000);
			});
		})
		.then((audioFile) => {
			audioFile.stop();
		});
	}).timeout(5000);

	it("can pad both sides of files", function() {
		return AudioFile.createFromFile(SIN_WAVE_LOCATION)
		.then((audioFile) => {
			audioFile.pad(1);
			return audioFile.play();
		});
	}).timeout(5000);

	it("can pad left of files", function() {
		return AudioFile.createFromFile(SIN_WAVE_LOCATION)
		.then((audioFile) => {
			audioFile.padLeft(1);
			return audioFile.play();
		});
	}).timeout(5000);

	it("can pad right of files", function() {
		return AudioFile.createFromFile(SIN_WAVE_LOCATION)
		.then((audioFile) => {
			audioFile.padRight(1);
			return audioFile.play();
		});
	}).timeout(5000);

	it("can trim silence off files", function() {
		return AudioFile.createFromFile(SIN_WAVE_LOCATION)
		.then((audioFile) => {
			audioFile.pad(1);
			audioFile.trimSilent();
			return audioFile.play();
		});
	}).timeout(5000);

	it("can write itself to a new file and return the path", function() {
		return AudioFile.createFromFile(SIN_WAVE_LOCATION)
		.then((audioFile) => {
			let filePath = audioFile.getWavPath();
			expect(fs.existsSync(filePath)).to.be.true;
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
			}
		});
	});

	it("can write itself to a specified file location", function() {
		return AudioFile.createFromFile(SIN_WAVE_LOCATION)
		.then((audioFile) => {
			let fileName = "./test/testLoc";
			let filePath = audioFile.writeToFile(fileName);
			expect(fs.existsSync(fileName + ".wav")).to.be.true;
			if (fs.existsSync(fileName + ".wav")) {
				fs.unlinkSync(fileName + ".wav");
			}
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
