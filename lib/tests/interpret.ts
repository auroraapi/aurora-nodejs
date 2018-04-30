import { Interpret } from '../interpret';
import { expect } from 'chai';

describe("#interpret", () => {
  it("should work with no intent or entities", done => {
    const text = "some text";
    const i = new Interpret({ text });
    expect(i.text).to.equal(text);
    expect(i.intent).to.be.undefined;
    expect(i.entities).to.be.undefined;
    done();
  });

  it("should work with no entities", done => {
    const text = "some text";
    const intent = "some_intent";
    const i = new Interpret({ text, intent });
    expect(i.text).to.equal(text);
    expect(i.intent).to.equal(intent);
    expect(i.entities).to.be.undefined;
    done();
  });

  it("should work with no intent", done => {
    const text = "some text";
    const entities = { "some_entity": "some value" };
    const i = new Interpret({ text, entities });
    expect(i.text).to.equal(text);
    expect(i.intent).to.be.undefined;
    expect(i.entities).to.deep.equal(entities);
    done();
  });

  it("should work with all fields", done => {
    const text = "some text";
    const intent = "some_intent";
    const entities = { "some_entity": "some value" };
    const i = new Interpret({ text, intent, entities });
    expect(i.text).to.equal(text);
    expect(i.intent).to.equal(intent);
    expect(i.entities).to.deep.equal(entities);
    done();
  });
})