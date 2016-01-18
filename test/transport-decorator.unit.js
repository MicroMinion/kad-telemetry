'use strict';

var expect = require('chai').expect;
var TEST_FILE = require('os').tmpdir() + '/telemetry.test';
var kad = require('kad');
var Persistence = require('../lib/persistence');
var AddressPortContact = kad.contacts.AddressPortContact;
var UDPTransport = kad.transports.UDP;
var TransportDecorator = require('../lib/transport-decorator');
var metrics = require('../lib/metrics');

describe('TransportDecorator', function() {

  it('should return a decorated transport', function() {
    var TelemetryTransport = TransportDecorator(UDPTransport);
    expect(TelemetryTransport.name).to.equal('TelemetryTransport');
    expect(TelemetryTransport.DEFAULT_METRICS).to.have.lengthOf(4);
  });

  describe('TelemetryTransport', function() {

    var TelemetryTransport = TransportDecorator(UDPTransport);

    it('should create a persistence instance', function() {
      var transport = new TelemetryTransport(AddressPortContact({
        address: '127.0.0.1',
        port: 0
      }), { telemetry: { filename: TEST_FILE } });
      expect(transport.telemetry).to.be.instanceOf(Persistence);
    });

    it('should use the options supplied', function() {
      var transport = new TelemetryTransport(AddressPortContact({
        address: '127.0.0.1',
        port: 0
      }), {
        telemetry: {
          filename: TEST_FILE,
          metrics: [metrics.Latency]
        }
      });
      expect(transport._telopts.metrics[0]).to.equal(metrics.Latency);
      expect(transport._telopts.metrics.length).to.equal(1);
    });

    it('should use the default options if none supplied', function() {
      var transport = TelemetryTransport(AddressPortContact({
        address: '127.0.0.1',
        port: 0
      }), {
        telemetry: {
          filename: TEST_FILE
        }
      });
      expect(transport._telopts.metrics.length).to.equal(4);
    });

    it('should register hooks for the metrics defined', function() {
      var transport = new TelemetryTransport(AddressPortContact({
        address: '127.0.0.1',
        port: 0
      }), {
        telemetry: {
          filename: TEST_FILE
        }
      });
      expect(Object.keys(transport._hooks.before).length).to.not.equal(0);
    });

  });

});
