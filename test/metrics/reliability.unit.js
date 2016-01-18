'use strict';

var expect = require('chai').expect;
var kad = require('kad');
var Message = kad.Message;
var Contact = kad.contacts.AddressPortContact;
var ReliabilityMetric = require('../../lib/metrics/reliability');
var Persistence = require('../../lib/persistence');
var profiles = new Persistence(require('os').tmpdir() + '/' + Date.now());

describe('ReliabilityMetric', function() {

  describe('@constructor', function() {

    it('should create instance without the new keyword', function() {
      expect(ReliabilityMetric()).to.be.instanceOf(ReliabilityMetric);
    });

    it('should create instance with the new keyword', function() {
      expect(new ReliabilityMetric()).to.be.instanceOf(ReliabilityMetric);
    });

    it('should define the profile key', function() {
      expect(ReliabilityMetric().key).to.equal('reliability');
    });

    it('should define the default metric values', function() {
      expect(ReliabilityMetric().default[0]).to.equal(0);
      expect(ReliabilityMetric().default[1]).to.equal(0);
    });

  });

  describe('#_recordResponseType', function() {

    it('should ignore inbound requests', function() {
      var m = ReliabilityMetric();
      var h = m._recordResponseType(m, profiles);
      var c = new Contact({ address: '127.0.0.1', port: 1 });
      var b = new Message({
        method: 'PING', params: { contact: c }
      });
      h(b, c, function() {
        var p = profiles.getProfile(c);
        var v = m.getMetric(p);
        expect(v[0]).to.equal(m.default[0]);
        expect(v[1]).to.equal(m.default[1]);
      });
    });

    it('should increment error response value', function() {
      var m = ReliabilityMetric();
      var h = m._recordResponseType(m, profiles);
      var c = new Contact({ address: '127.0.0.1', port: 1 });
      var b = new Message({
        id: 'test', result: { contact: c }, error: new Error('error')
      });
      h(b, c, function() {
        var p = profiles.getProfile(c);
        var v = m.getMetric(p);
        expect(v[0]).to.equal(m.default[0]);
        expect(v[1]).to.equal(1);
      });
    });

    it('should increment success response value', function() {
      var m = ReliabilityMetric();
      var h = m._recordResponseType(m, profiles);
      var c = new Contact({ address: '127.0.0.1', port: 1 });
      var b = new Message({
        id: 'test', result: { contact: c }
      });
      h(b, c, function() {
        var p = profiles.getProfile(c);
        var v = m.getMetric(p);
        expect(v[0]).to.equal(1);
        expect(v[1]).to.equal(1);
      });
    });

  });

});

describe('ReliabilityMetric#score', function() {

  it('should score based on successes/all_responses', function() {
    expect(ReliabilityMetric.score([1, 1])).to.equal(0.5);
    expect(ReliabilityMetric.score([0, 1])).to.equal(0);
    expect(ReliabilityMetric.score([3, 1])).to.equal(0.75);
    expect(ReliabilityMetric.score([1, 3])).to.equal(0.25);
  });

});
