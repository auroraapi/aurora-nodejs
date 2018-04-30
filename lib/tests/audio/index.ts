import { WAV } from '../../audio/wav';
import { AudioFile, createRecordingStream } from '../../audio';
import { opts } from '../../audio/util';
import { AuroraError, APIError } from '../../errors';

import { expect } from 'chai';
import fs from 'fs';

const AUDIO_FILE = "lib/tests/test.wav";

const t = (ms: number) => new Promise((resolve, reject) => setTimeout(resolve, ms));

describe("#AudioFile", () => {
	before(done => {
		opts.ignoreLeadingSilence = false;
		done();
	});

	after(done => {
		opts.ignoreLeadingSilence = true;
		done();
	})

	it("should create AudioFile from WAV", done => {
		const wav = new WAV(new Buffer([10,20,30,40]));
		const audio = new AudioFile(wav);

		expect(audio).to.be.an.instanceOf(AudioFile);
		expect(audio.getAudio()).to.be.an.instanceOf(WAV);
		expect(audio.getWAVData().toString()).to.equal(wav.data().toString());
		done();
	});

	it("should create AudioFile from Buffer", done => {
		const buf = fs.readFileSync(AUDIO_FILE);
		const wav = WAV.fromBuffer(buf);
		const audio = new AudioFile(buf);

		expect(audio).to.be.an.instanceOf(AudioFile);
		expect(audio.getAudio()).to.be.an.instanceOf(WAV);
		expect(audio.getAudio().audioData.toString()).to.equal(wav.audioData.toString());
		done();
	});

	it("should create AudioFile from Stream", done => {
		const buf = fs.readFileSync(AUDIO_FILE);
		const wav = WAV.fromBuffer(buf);

		AudioFile.fromStream(fs.createReadStream(AUDIO_FILE))
			.then(audio => {
				expect(audio).to.be.an.instanceOf(AudioFile);
				expect(audio.getAudio()).to.be.an.instanceOf(WAV);
				expect(audio.getAudio().audioData.toString()).to.equal(wav.audioData.toString());
				done();
			})
			.catch(done);
	});

	it("should create AudioFile from recording", done => {
		AudioFile.fromRecording(0.25, 0)
			.then(audio => {
				expect(audio).to.be.an.instanceOf(AudioFile);
				expect(audio.getAudio()).to.be.an.instanceOf(WAV);
				done();
			})
			.catch(done);
	});

	it("should play an AudioFile", done => {
		AudioFile.fromStream(fs.createReadStream(AUDIO_FILE))
			.then(audio => {
				audio.play();
				return Promise.resolve().then(() => t(1000));
			})
			.then(done)
			.catch(done);
	}).timeout(6000);

	it("should create a recording stream", done => {
		const s = createRecordingStream(0.25, 0);

		const bufs: Buffer[] = [];
		s.on('data', (data: Buffer) => bufs.push(data));
		s.on('end', () => {
			try {
				expect(bufs.length).to.be.greaterThan(1);
				expect(bufs[0].byteLength).to.equal(44);
				done();
			} catch (e) {
				done(e);
			}
		})
		s.on('error', done);
	});
});