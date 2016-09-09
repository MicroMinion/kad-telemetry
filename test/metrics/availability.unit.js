'use strict'

var expect = require('chai').expect
var kad = require('kad-js')
var Message = kad.Message
var Contact = kad.contacts.AddressPortContact
var AvailabilityMetric = require('../../lib/metrics/availability')
var Persistence = require('../../lib/persistence')
var profiles = new Persistence(require('os').tmpdir() + '/' + Date.now())

describe('AvailabilityMetric', function () {

  describe('@constructor', function () {

    it('should create instance without the new keyword', function () {
      expect(AvailabilityMetric()).to.be.instanceOf(AvailabilityMetric)
    })

    it('should create instance with the new keyword', function () {
      expect(new AvailabilityMetric()).to.be.instanceOf(AvailabilityMetric)
    })

    it('should define the profile key', function () {
      expect(AvailabilityMetric().key).to.be.equal('availability')
    })

    it('should define the default metric values', function () {
      expect(AvailabilityMetric().default[0]).to.be.equal(0)
      expect(AvailabilityMetric().default[1]).to.be.equal(0)
    })

  })

  describe('#_start', function () {

    it('should record the outbound request', function () {
      var m = AvailabilityMetric()
      var h = m._start(m, profiles)
      var c = new Contact({ address: '127.0.0.1', port: 1 })
      var b = new Message({
        method: 'PING', params: { contact: c }
      }).serialize()
      h(b, c, function () {
        var p = profiles.getProfile(c)
        var v = m.getMetric(p)
        expect(v[0]).to.equal(1)
      })
    })

    it('should skip the outbound response', function () {
      var m = AvailabilityMetric()
      var h = m._start(m, profiles)
      var c = new Contact({ address: '127.0.0.1', port: 1 })
      var b = new Message({
        id: 'test', result: { contact: c }
      }).serialize()
      h(b, c, function () {
        var p = profiles.getProfile(c)
        var v = m.getMetric(p)
        expect(v[0]).to.equal(1)
      })
    })

  })

  describe('#_stop', function () {

    it('should record the inbound response', function () {
      var m = AvailabilityMetric()
      var h = m._stop(m, profiles)
      var c = new Contact({ address: '127.0.0.1', port: 1 })
      var b = new Message({
        id: 'test', result: { contact: c }
      })
      h(b, c, function () {
        var p = profiles.getProfile(c)
        var v = m.getMetric(p)
        expect(v[1]).to.equal(1)
      })
    })

    it('should skip the inbound request', function () {
      var m = AvailabilityMetric()
      var h = m._stop(m, profiles)
      var c = new Contact({ address: '127.0.0.1', port: 1 })
      var b = new Message({
        method: 'PING', params: { contact: c }
      })
      h(b, c, function () {
        var p = profiles.getProfile(c)
        var v = m.getMetric(p)
        expect(v[1]).to.equal(1)
      })
    })

  })

})

describe('AvailabilityMetric#score', function () {

  it('should calculate the score as responses/requests', function () {
    expect(AvailabilityMetric.score([2, 2])).to.equal(1)
    expect(AvailabilityMetric.score([2, 1])).to.equal(0.5)
  })

})
