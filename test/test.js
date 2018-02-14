'use strict';

var expect = require('chai').expect;
var aurora = require('../index');

describe('#aurora', function(){
  it('should get "Hello, world!"', function(){
    var result = aurora.getHelloWorld();
    expect(result).to.equal('Hello, world!');
  });

  it('should sum up two numbers', function(){
    var sum = aurora.getSum(3, 5);
    expect(sum).to.equal(8);
  });
});
