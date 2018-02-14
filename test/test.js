'use strict';

var expect = require('chai').expect;
var aurora = require('../index');

describe('#aurora', function(){
  it ('should return "Hello, world!"', function(){
    var result = aurora(3);
    expect(result).to.equal('Hello, world!');
  });
});
