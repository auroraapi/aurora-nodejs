import { AuroraBackend } from "../api/backend/aurora";
import { MockBackend } from "../api/backend/mock";
import { Text } from "../text";
import { Speech } from "../speech";
import { Interpret } from "../interpret";
import { APIError } from "../errors";
import { config } from "../config";
import { expect } from 'chai';

import fs from 'fs';

const AUDIO_FILE = "lib/tests/test.wav";

describe("#text", () => {
	after(done => {
		config.backend = new AuroraBackend();
		done();
	});

	it("should be able to create an object", done => {
    const text = "some text"
    const t = new Text(text);
    expect(t.text).to.equal(text);
    done();
  });
  
	it("text to speech", done => {
		config.backend = new MockBackend(fs.createReadStream(AUDIO_FILE));
		const text = new Text("hello");
		text.speech()
			.then(speech => {
				expect(speech).to.be.an.instanceof(Speech);
				expect(speech.audio.getAudio().audioData.byteLength).to.be.greaterThan(100);
			})
			.then(done)
			.catch(done);
	}).timeout(10000);

	it("interpret", done => {
		config.backend = new MockBackend({
			text: "what is the time in los angeles",
			intent: "time",
			entities: {
				location: "los angeles",
			},
		});
		const text = new Text("what is the time in los angeles");
		text.interpret()
			.then(int => {
				expect(int).to.be.an.instanceof(Interpret);
				expect(int.text!).to.exist;
				expect(int.text!).equal("what is the time in los angeles")
				expect(int.intent!).to.exist;
				expect(int.intent!).to.equal("time");
				expect(int.entities!).to.exist;
				expect(int.entities!.location).to.equal("los angeles");
				done();
			})
			.catch(done);
	}).timeout(10000);
})