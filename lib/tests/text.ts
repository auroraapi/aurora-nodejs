import { Text } from "../text";
import { Speech } from "../speech";
import { Interpret } from "../interpret";
import { APIError } from "../errors";
import { config } from "../config";
import { expect } from 'chai';

describe("#text", () => {
  it("should be able to create an object", done => {
    const text = "some text"
    const t = new Text(text);
    expect(t.text).to.equal(text);
    done();
  });

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
});

describe("#text", () => {
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
  
	it("text to speech", done => {
		const text = new Text("hello");
		text.speech()
			.then(speech => {
				expect(speech).to.be.an.instanceof(Speech);
				expect(speech.audio.getAudio().audioData.byteLength).to.be.greaterThan(100);
				return speech.audio.play();
			})
			.then(done)
			.catch(done);
	}).timeout(10000);

	it("interpret", done => {
		const text = new Text("what is the time in los angeles");
		text.interpret()
			.then(int => {
				expect(int).to.be.an.instanceof(Interpret);
				expect(int.intent!).to.exist;
				expect(int.intent!).to.equal("time");
				expect(int.entities!).to.exist;
				expect(int.entities!.location).to.equal("los angeles");
				done();
			})
			.catch(done);
	}).timeout(10000);
})