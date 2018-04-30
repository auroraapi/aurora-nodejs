import { Backend, CallParams, Credentials, Method } from '../../../api/backend';
import { MockBackend } from '../../../api/backend/mock';
import { expect } from 'chai';

describe('#MockBackend', () => {
	it('should return data on successful call', done => {
    const backend = new MockBackend({ data: true });
    const params = { method: Method.GET, path: '/', credentials: {} };
    backend.call(params)
      .then(res => {
        expect(res).to.haveOwnProperty('data');
        expect(res.data).to.be.true;
      })
      .then(done)
      .catch(done);
  });

  it('should throw data on failed call', done => {
    const backend = new MockBackend({ data: true }, 500);
    const params = { method: Method.GET, path: '/', credentials: {} };
    backend.call(params)
      .then(() => done(new Error('call should not succeed')))
      .catch(res => {
        expect(res).to.haveOwnProperty('data');
        expect(res.data).to.be.true;
        done();        
      })
      .catch(done);
  });
});
