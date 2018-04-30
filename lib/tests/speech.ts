import { AuroraBackend } from "../api/backend/aurora";
import { MockBackend } from "../api/backend/mock";
import { Text } from "../text";
import { Speech } from "../speech";
import { Interpret } from "../interpret";
import { AudioFile } from "../audio";
import { APIError } from "../errors";
import { config } from "../config";

import { expect } from 'chai';
import fs from "fs";

const AUDIO_FILE = "lib/tests/test.wav";

describe("#speech", () => {
	after(done => {
		config.backend = new AuroraBackend();
		done();
	});

	it("should be able to create an object", done => {
		const s = new Speech(new AudioFile(fs.readFileSync(AUDIO_FILE)));
    expect(s.audio).to.be.an.instanceof(AudioFile);
    expect(s.audio.getWAVData().byteLength).to.be.greaterThan(44);
    done();
  });

	it("speech to text", done => {
		config.backend = new MockBackend({ transcript: "Hello world" });
		const speech = new Speech(new AudioFile(fs.readFileSync(AUDIO_FILE)));
		speech.text()
			.then(text => {
				expect(text).to.be.an.instanceof(Text);
				expect(text.text).to.equal("Hello world");
				done();
			})
			.catch(done);
	});
})