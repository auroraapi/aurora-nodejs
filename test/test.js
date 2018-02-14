'use strict';

let expect = require('chai').expect;
let aurora = require('../index');

describe('#aurora', function(){
  it("stores and retrieves an app ID", function() {
    const testAppId = "123456";
    aurora.setAppId(testAppId);
    expect(aurora.getAppId()).to.equal(testAppId);
  });

  it("stores and retrieves an app token", function() {
    const testAppToken = "123456";
    aurora.setAppToken(testAppToken);
    expect(aurora.getAppToken()).to.equal(testAppToken);
  });

  it("stores and retrieves a device ID", function() {
    const testDeviceID = "123456";
    aurora.setDeviceId(testDeviceID);
    expect(aurora.getDeviceId()).to.equal(testDeviceID);
  });
});
