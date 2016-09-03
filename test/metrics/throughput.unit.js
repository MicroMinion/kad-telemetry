'use strict';

var expect = require('chai').expect;
var kad = require('kad-js');
var Message = kad.Message;
var Contact = kad.contacts.AddressPortContact;
var ThroughputMetric = require('../../lib/metrics/throughput');
var Persistence = require('../../lib/persistence');
var profiles = new Persistence(require('os').tmpdir() + '/' + Date.now());

describe('ThroughputMetric', function() {

  describe('@constructor', function() {

    it('should create instance without the new keyword', function() {
      expect(ThroughputMetric()).to.be.instanceOf(ThroughputMetric);
    });

    it('should create instance with the new keyword', function() {
      expect(new ThroughputMetric()).to.be.instanceOf(ThroughputMetric);
    });

    it('should define the profile key', function() {
      expect(ThroughputMetric().key).to.equal('throughput');
    });

    it('should define the default metric values', function() {
      expect(ThroughputMetric().default[0]).to.equal(0);
      expect(ThroughputMetric().default[1]).to.equal(0);
      expect(ThroughputMetric().default[2]).to.equal(0);
    });

  });

  describe('#_start', function() {

    it('should ignore outbound responses', function() {
      var m = ThroughputMetric();
      var h = m._start(m, profiles);
      var c = new Contact({ address: '127.0.0.1', port: 1 });
      var b = new Message({
        id: 'test', result: { contact: c }
      });
      h(b.serialize(), c, function() {
        expect(m._tests.test).to.equal(undefined);
      });
    });

    it('should create timer for outbound requests', function() {
      var m = ThroughputMetric();
      var h = m._start(m, profiles);
      var c = new Contact({ address: '127.0.0.1', port: 1 });
      var b = new Message({
        method: 'PING', params: { contact: c }
      });
      h(b.serialize(), c, function() {
        expect(typeof m._tests[b.id]).to.equal('number');
      });
    });

  });

  describe('#_stop', function() {

    it('should ignore inbound requests', function() {
      var m = ThroughputMetric();
      var h = m._stop(m, profiles);
      var c = new Contact({ address: '127.0.0.1', port: 1 });
      var b = new Message({
        method: 'PING', params: { contact: c }
      });
      var p = profiles.getProfile(c);
      h(b, c, function() {
        expect(m.getMetric(p)[0]).to.equal(m.default[0]);
        expect(m.getMetric(p)[1]).to.equal(m.default[1]);
        expect(m.getMetric(p)[2]).to.equal(m.default[2]);
      });
    });

    it('should ignore inbound responses that timed out', function() {
      var m = ThroughputMetric();
      var h = m._stop(m, profiles);
      var c = new Contact({ address: '127.0.0.1', port: 1 });
      var b = new Message({
        id: 'timed_out', result: { contact: c }
      });
      var p = profiles.getProfile(c);
      h(b, c, function() {
        expect(m.getMetric(p)[0]).to.equal(m.default[0]);
        expect(m.getMetric(p)[1]).to.equal(m.default[1]);
        expect(m.getMetric(p)[2]).to.equal(m.default[2]);
      });
    });

    it('should update the metric values', function() {
      var m = ThroughputMetric();
      m._tests.test2 = Date.now() - 50;
      var h = m._stop(m, profiles);
      var c = new Contact({ address: '127.0.0.1', port: 1 });
      var b = new Message({
        id: 'test2', result: { contact: c }
      });
      h(b, c, function() {
        var p = profiles.getProfile(c);
        expect(m.getMetric(p)[0]).to.equal(1);
        expect(m.getMetric(p)[1]).to.equal(b.serialize().length);
        expect(m.getMetric(p)[2]).to.be.greaterThan(m.default[2]);
      });
    });

  });

});

describe('ThroughputMetric#score', function() {

  it('should score the metric 0 if no data', function() {
    expect(ThroughputMetric.score([0, 0, 0])).to.equal(0);
  });

  it('should score the metric by bytes/sec', function() {
    expect(ThroughputMetric.score([5, 500, 50000])).to.equal(10);
    expect(ThroughputMetric.score([100, 51200, 200000])).to.equal(256);
  });

});
