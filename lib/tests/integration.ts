import { AudioFile } from '../audio';
import { Speech } from '../speech';
import { Interpret } from '../interpret';
import { Text } from '../text';
import { AuroraError, APIError } from '../errors';
import config from '../config';

import { expect } from 'chai';
import fs from 'fs';

const AUDIO_FILE = "lib/tests/helloFriends.wav";

describe("#NegativeIntegrationTests", () => {
	it("TTS should fail due to credentials", done => {
		const text = new Text("hello");
		text.speech()
			.then(() => {
				done(new Error("expected to fail"));
			})
			.catch(err => {
				expect(err).to.be.instanceof(APIError);
				expect(err.status).to.equal(400);
				expect(err.code).to.contain("Missing");
				done();
			})
			.catch(done);
	});
	it("Interpret should fail due to credentials", done => {
		const text = new Text("hello");
		text.interpret()
			.then(() => {
				done(new Error("expected to fail"));
			})
			.catch(err => {
				expect(err).to.be.instanceof(APIError);
				expect(err.status).to.equal(400);
				expect(err.code).to.contain("Missing");
				done();
			})
			.catch(done);
	});
	it("STT should fail due to credentials", done => {
		const speech = new Speech(new AudioFile(fs.readFileSync(AUDIO_FILE)));
		speech.text()
			.then(() => {
				done(new Error("expected to fail"));
			})
			.catch(err => {
				expect(err).to.be.instanceof(APIError);
				expect(err.status).to.equal(400);
				expect(err.code).to.contain("Missing");
				done();
			})
			.catch(done);
	});
});

describe("#PositiveIntegrationTests", () => {
	before(done => {
		config.appId = process.env.APP_ID || "";
		config.appToken = process.env.APP_TOKEN || "";
		config.deviceId = process.env.DEVICE_ID || "";
		done();
	});

	after(done => {
		config.appId = "";
		config.appToken = "";
		config.deviceId = "";
		done();
	});

	it("speech to text", done => {
		const speech = new Speech(new AudioFile(fs.readFileSync(AUDIO_FILE)));
		speech.text()
			.then(text => {
				expect(text).to.be.an.instanceof(Text);
				expect(text.text.length).to.be.greaterThan(0);
				done();
			})
			.catch(done);
	}).timeout(10000);

	it("text to speech", done => {
		const text = new Text("hello");
		text.speech()
			.then(speech => {
				expect(speech).to.be.an.instanceof(Speech);
				expect(speech.audio.getAudio().audioData.byteLength).to.be.greaterThan(100);
				done()
			})
			.catch(done);
	}).timeout(10000);

	it("interpret", done => {
		const text = new Text("what is the time in los angeles");
		text.interpret()
			.then(int => {
				expect(int).to.be.an.instanceof(Interpret);
				expect(int.intent).to.exist;
				expect(int.intent).to.equal("time");
				expect(int.entities).to.exist;
				expect(int.entities.location).to.equal("los angeles");
				done();
			})
			.catch(done);
	}).timeout(10000);
});