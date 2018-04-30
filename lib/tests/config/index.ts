import { config, Config } from "../../config";
import { AuroraBackend } from "../../api/backend/aurora";
import * as aurora from "../..";

import { expect } from "chai";

describe("#config", () => {
  after(done => {
    config.appId = undefined;
    config.appToken = undefined;
    config.deviceId = undefined;
    done();
  });

  it("should create a Config", done => {
    const c = new Config();
    expect(c.appId).to.be.undefined;
    expect(c.appToken).to.be.undefined;
    expect(c.deviceId).to.be.undefined;
    expect(c.backend).to.be.an.instanceof(AuroraBackend);

    c.appId = "app";
    expect(c.appId).to.equal("app");
    done();
  });

  it("should be able to set and retrieve config", done => {
    config.appId = "app";
    config.appToken = "token";
    config.deviceId = "device";

    expect(aurora.config.appId).to.equal("app");
    expect(aurora.config.appToken).to.equal("token");
    expect(aurora.config.deviceId).to.equal("device");
    expect(aurora.config.backend).to.be.an.instanceof(AuroraBackend)
    done();
  });
})