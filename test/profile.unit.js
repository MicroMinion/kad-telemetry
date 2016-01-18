'use strict';

var expect = require('chai').expect;
var Profile = require('../lib/profile');

describe('Profile', function() {

  describe('@constructor', function() {

    it('should create an instance without the new keyword', function() {
      expect(Profile()).to.be.instanceOf(Profile);
    });

    it('should create an instance with the new keyword', function() {
      expect(new Profile()).to.be.instanceOf(Profile);
    });

    it('should set the default properties', function() {
      var p = new Profile();
      expect(p.metrics).to.be.instanceOf(Object);
      expect(Object.keys(p.metrics).length).to.equal(0);
    });

    it('should set the metric properties passed', function() {
      var p = new Profile({ metrics: { test: 0 } });
      expect(p.metrics).to.be.instanceOf(Object);
      expect(p.metrics.test).to.equal(0);
    });

  });

});
