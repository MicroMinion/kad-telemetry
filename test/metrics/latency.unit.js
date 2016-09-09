'use strict'

var expect = require('chai').expect
var kad = require('kad-js')
var Message = kad.Message
var Contact = kad.contacts.AddressPortContact
var LatencyMetric = require('../../lib/metrics/latency')
var Persistence = require('../../lib/persistence')
var profiles = new Persistence(require('os').tmpdir() + '/' + Date.now())

describe('LatencyMetric', function () {

  describe('@constructor', function () {

    it('should create instance without the new keyword', function () {
      expect(LatencyMetric()).to.be.instanceOf(LatencyMetric)
    })

    it('should create instance with the new keyword', function () {
      expect(new LatencyMetric()).to.be.instanceOf(LatencyMetric)
    })

    it('should define the profile key', function () {
      expect(LatencyMetric().key).to.equal('latency')
    })

    it('should define the default metric values', function () {
      expect(LatencyMetric().default[0]).to.equal(0)
    })

  })

  describe('#_start', function () {

    it('should create a timestamp for an outbound request', function () {
      var m = LatencyMetric()
      var h = m._start(m, profiles)
      var c = new Contact({ address: '127.0.0.1', port: 1 })
      var b = new Message({
        method: 'PING', params: { contact: c }
      })
      h(b.serialize(), c, function () {
        expect(typeof m._tests[b.id].started).to.equal('number')
      })
    })

    it('should not create a timestamp for an outbound response', function () {
      var m = LatencyMetric()
      var h = m._start(m, profiles)
      var c = new Contact({ address: '127.0.0.1', port: 1 })
      var b = new Message({
        id: 'test', result: { contact: c }
      }).serialize()
      h(b, c, function () {
        expect(typeof m._tests.test).to.equal('undefined')
      })
    })

  })

  describe('#_stop', function () {

    it('should skip over inbound requests', function () {
      var m = LatencyMetric()
      var h = m._stop(m, profiles)
      var c = new Contact({ address: '127.0.0.1', port: 1 })
      var b = new Message({
        method: 'PING', params: { contact: c }
      })
      var p = profiles.getProfile(c)
      var v = m.getMetric(p)
      h(b, c, function () {
        expect(m.getMetric(p)[0]).to.equal(v[0])
      })
    })

    it('should skip over responses that timed out', function () {
      var m = LatencyMetric()
      var h = m._stop(m, profiles)
      var c = new Contact({ address: '127.0.0.1', port: 1 })
      var b = new Message({
        id: 'test2', result: { contact: c }
      })
      var p = profiles.getProfile(c)
      var v = m.getMetric(p)[0]
      h(b, c, function () {
        expect(m.getMetric(p)[0]).to.equal(v)
      })
    })

    it('should update the latency value', function () {
      var m = LatencyMetric()
      var h = m._stop(m, profiles)
      var c = new Contact({ address: '127.0.0.1', port: 1 })
      var b = new Message({
        id: 'test', result: { contact: c }
      })
      m._tests.test = { started: Date.now() - 100 }
      h(b, c, function () {
        var p = profiles.getProfile(c)
        var v = m.getMetric(p)
        expect(v[0]).to.not.equal(m.default[0])
      })
    })

  })

  describe('#_expireTimeouts', function () {

    it('should remove entries that are older than TEST_TIMEOUT', function () {
      var m = new LatencyMetric()
      m._tests = {
        0: { started: Date.now() - 1000 },
        1: { started: Date.now() - 6000 },
        2: { started: Date.now() - 2500 },
        3: { started: Date.now() - 6000 },
        4: { started: Date.now() - 0 }
      }
      m._expireTimeouts()
      expect(m._tests[0]).to.not.equal(undefined)
      expect(m._tests[1]).to.equal(undefined)
      expect(m._tests[2]).to.not.equal(undefined)
      expect(m._tests[3]).to.equal(undefined)
      expect(m._tests[4]).to.not.equal(undefined)
    })

  })

})

describe('LatencyMetric#score', function () {

  it('should scored based on the remaining time before timeout', function () {
    expect(LatencyMetric.score([1000])).to.equal(0.8)
    expect(LatencyMetric.score([2500])).to.equal(0.5)
  })

})
