'use strict'

var expect = require('chai').expect
var sinon = require('sinon')
var kad = require('kad-js')
var Router = kad.Router
var RouterDecorator = require('../lib/router-decorator')
var TransportDecorator = require('../lib/transport-decorator')
var TelemetryRouter = RouterDecorator(Router)
var TelemetryTransport = TransportDecorator(kad.transports.UDP)
var Contact = kad.contacts.AddressPortContact
var Profile = require('../lib/profile')
var filename = require('os').tmpdir() + '/' + Date.now()

describe('RouterDecorator', function () {

  it('should return a decorated transport', function () {
    var TelemetryRouter = RouterDecorator(Router)
    expect(TelemetryRouter.name).to.equal('TelemetryRouter')
  })

  describe('TelemetryRouter', function () {

    describe('#getNearestContacts', function () {

      it('should sort the result using _compare', function () {
        var router = TelemetryRouter({
          transport: TelemetryTransport(Contact({
            address: '127.0.0.1',
            port: 2
          }), { telemetry: { filename: filename } }),
          logger: kad.Logger(0)
        })
        var _gnc = sinon.stub(
          Router.prototype, 'getNearestContacts'
        ).returns([0, 1, 2])
        var _cmp = sinon.stub(router, '_compare', function (a, b) {
          return b - a
        })
        router.getNearestContacts()
        expect(_gnc.called).to.equal(true)
        expect(_cmp.callCount).to.equal(3)
        _gnc.restore()
        _cmp.restore()
      })

    })

    describe('#_compare', function () {

      var router = new TelemetryRouter({
        transport: TelemetryTransport(Contact({
          address: '127.0.0.1',
          port: 3
        }), { telemetry: { filename: filename } }),
        logger: kad.Logger(0)
      })
      var contacts = [
        { nodeID: 1 },
        { nodeID: 2 },
        { nodeID: 3 },
        { nodeID: 4 },
        { nodeID: 5 },
        { nodeID: 6 },
        { nodeID: 7 },
        { nodeID: 8 },
        { nodeID: 9 },
        { nodeID: 10 }
      ]
      var metrics = {
        1: {
          availability: [5, 5],
          reliability: [4, 1],
          latency: [50],
          throughput: [5, 1000, 50]
        },
        2: {
          availability: [6, 5],
          reliability: [5, 0],
          latency: [55],
          throughput: [5, 1200, 50]
        },
        3: {
          availability: [10, 9],
          reliability: [4, 5],
          latency: [63],
          throughput: [9, 2350, 90]
        },
        4: {
          availability: [1, 1],
          reliability: [1, 0],
          latency: [124],
          throughput: [1, 20, 10]
        },
        5: {
          availability: [6, 3],
          reliability: [3, 0],
          latency: [32],
          throughput: [3, 600, 30]
        },
        6: {
          availability: [1, 1],
          reliability: [1, 1],
          latency: [18],
          throughput: [1, 1400, 10]
        },
        7: {
          availability: [1, 1],
          reliability: [1, 1],
          latency: [17],
          throughput: [1, 1200, 10]
        },
        8: {
          availability: [3, 2],
          reliability: [2, 0],
          latency: [200],
          throughput: [2, 960, 20]
        },
        9: {
          availability: [20, 15],
          reliability: [10, 5],
          latency: [1050],
          throughput: [15, 8000, 150]
        },
        10: {
          availability: [1, 1],
          reliability: [0, 1],
          latency: [3000],
          throughput: [1, 512, 10]
        }
      }
      var _get = sinon.stub(router._rpc.telemetry, 'getProfile', function (c) {
        return new Profile({
          metrics: metrics[c.nodeID]
        })
      })

      it('should sort the contacts by best performing', function () {
        var shortlist = contacts.sort(router._compare.bind(router))
        var expected = [4, 2, 1, 8, 6, 7, 5, 3, 9, 10]

        shortlist.forEach(function (contact, index) {
          expect(expected[index] === contact.nodeID)
        })
      })

      after(function () {
        _get.restore()
      })

    })

  })

  describe('TelemetryRouter#getSuccessProbability', function () {

    it('should return the probability of success', function () {
      expect(TelemetryRouter.getSuccessProbability({
        reliability: 0,
        availability: 0,
        latency: 0
      })).to.equal(0)
      expect(TelemetryRouter.getSuccessProbability({
        reliability: 1,
        availability: 1,
        latency: 1
      })).to.equal(1)
      expect(TelemetryRouter.getSuccessProbability({
        reliability: 0.89,
        availability: 0.93,
        latency: 0.74
      })).to.equal(0.8533333333333334)
    })

  })

})
