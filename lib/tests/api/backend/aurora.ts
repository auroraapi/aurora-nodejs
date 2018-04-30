import { Backend, CallParams, Credentials, Method } from '../../../api/backend';
import { AuroraBackend, TTS_PATH } from '../../../api/backend/aurora';
import { AuroraError, APIError } from '../../../errors';

import { expect } from 'chai';
import fs from 'fs';

describe('#AuroraBackend', () => {
	it('should compile and set up backend', done => {
		const ab = new AuroraBackend();
		expect(ab).to.exist;
		expect(ab).to.be.an.instanceof(Backend);
		expect(ab).to.be.an.instanceof(AuroraBackend);
		done();
	});

	it('should fail with empty path', (done) => {
		const ab = new AuroraBackend();
		const opts = { method: Method.GET, path: '', credentials: {}};
		ab.call(opts)
			.then(() => done(new Error('Call should not succeed')))
			.catch(err => {
				expect(err).to.be.an.instanceof(APIError);
				expect(err.status).to.equal(404);
				expect(err.code).to.equal('NotFound');
			})
			.then(done)
			.catch(done);
	});

	it('should fail without credentials', done => {
		const ab = new AuroraBackend();
		const opts = { method: Method.GET, path: TTS_PATH, credentials: {}};
		ab.call(opts)
			.then(() => done(new Error('Call should not succeed')))
			.catch(err => {
				expect(err).to.be.an.instanceof(APIError);
				expect(err.code).to.include('Missing');
				expect(err.status).to.equal(400);
			})
			.then(done)
			.catch(done);
	});
});
