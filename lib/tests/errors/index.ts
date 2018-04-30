import { AuroraError, APIError } from "../../errors";
import { expect } from "chai";

describe("#errors", () => {
  it("should create an AuroraError",  done => {
    let e = new AuroraError("code", "message");
    expect(e).to.be.an.instanceof(Error);
    expect(e).to.be.an.instanceof(AuroraError);
    expect(e.message).to.equal("message");
    expect(e.code).to.equal("code");
    expect(e.info).to.equal("");

    e = new AuroraError("code", "message", "info");
    expect(e.info).to.equal("info");
    done();
  });

  it("should create an APIError", done => {
    let e = new APIError("code", "message", "id", "type", 400);
    expect(e).to.be.an.instanceof(Error);
    expect(e).to.be.an.instanceof(AuroraError);
    expect(e).to.be.an.instanceof(APIError);
    expect(e.message).to.equal("message");
    expect(e.code).to.equal("code");
    expect(e.id).to.equal("id");
    expect(e.type).to.equal("type");
    expect(e.status).to.equal(400);

    e = new APIError("code", "message", "id", "type", 400, "info");
    expect(e.info).to.equal("info");
    done();
  });
})