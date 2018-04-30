import { Text } from "../text";
import { Speech } from "../speech";
import { Interpret } from "../interpret";
import { AudioFile } from "../audio";
import { APIError } from "../errors";
import { config } from "../config";

import { expect } from 'chai';
import fs from "fs";

const AUDIO_FILE = "lib/tests/helloFriends.wav";

describe("#speech", () => {
  it("should be able to create an object", done => {
		const s = new Speech(new AudioFile(fs.readFileSync(AUDIO_FILE)));
    expect(s.audio).to.be.an.instanceof(AudioFile);
    expect(s.audio.getWAVData().byteLength).to.be.greaterThan(44);
    done();
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
	}).timeout(10000);
});

describe("#speech", () => {
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
})