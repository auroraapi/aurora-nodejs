import { WAV } from '../../audio/wav';
import { AuroraError, APIError } from '../../errors';

import { expect } from 'chai';
import fs from 'fs';

describe("#WAV", () => {
	it("should create an empty WAV", done => {
		const buf = new Buffer([10, 0, 24, 32]);
		const w = new WAV(buf, 2, 32000, 1, 16);
		expect(w.audioData).to.equal(buf);
		expect(w.numChannels).to.equal(2);
		expect(w.sampleRate).to.equal(32000);
		expect(w.audioFormat).to.equal(1);
		expect(w.bitsPerSample).to.equal(16);
		done();
	});

	it("should create a WAV from a file", done => {
		const f = fs.readFileSync('lib/tests/helloFriends.wav');
		const w = WAV.fromBuffer(f);
		// these are based on properties of the wav file
		expect(w.audioData.length).to.equal(f.length - 44);
		expect(w.numChannels).to.equal(1);
		expect(w.sampleRate).to.equal(44100);
		expect(w.audioFormat).to.equal(1);
		expect(w.bitsPerSample).to.equal(16);
		done();
	});

	it("should create a WAV from stream", done => {
		const f = fs.readFileSync('lib/tests/helloFriends.wav');
		const s = fs.createReadStream('lib/tests/helloFriends.wav');
		WAV.fromStream(s)
			.then(w => {
				// these are based on properties of the wav file
				expect(w.audioData.length).to.equal(f.length - 44);
				expect(w.numChannels).to.equal(1);
				expect(w.sampleRate).to.equal(44100);
				expect(w.audioFormat).to.equal(1);
				expect(w.bitsPerSample).to.equal(16);
				done()
			})
			.catch(done);
	});

	it("should add audio data correctly", done => {
		const f = fs.readFileSync('lib/tests/helloFriends.wav');
		const w = WAV.fromBuffer(f);
		const oldData = w.audioData.slice();
		const addData = new Buffer([10,20,30,40]);
		w.addAudioData(addData);

		expect(w.audioData.toString()).to.equal(oldData.toString() + addData.toString());
		done();
	});

	it("should create WAV data buffer correctly", done => {
		const f = fs.readFileSync('lib/tests/helloFriends.wav');
		const w = WAV.fromBuffer(f);
		const d = w.data();

		const v = WAV.fromBuffer(d);
		expect(v.audioData.toString()).to.equal(w.audioData.toString());
		expect(v.numChannels).to.equal(w.numChannels);
		expect(v.sampleRate).to.equal(w.sampleRate);
		expect(v.audioFormat).to.equal(w.audioFormat);
		expect(v.bitsPerSample).to.equal(w.bitsPerSample);
		done();
	});
});