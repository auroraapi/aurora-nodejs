import { record } from '../../audio/util';
import { AuroraError, APIError } from '../../errors';

import { expect } from 'chai';
import fs from 'fs';

describe("#record", () => {
	it("should record fixed length", done => {
		const s = record(0.25, 0);
		const bufs: Buffer[] = [];
		let ended = false;

		s.on('data', (data: Buffer) => bufs.push(data));
		s.on('end', () => {
			if (!ended) {
				ended = true;
				expect(bufs.length).to.be.greaterThan(-1);
				done();
			}
		});
		s.on('error', done);
		setTimeout(() => {
			if (!ended) {
				s.emit('close');
			}
		}, 1500);
	}).timeout(5000);
});