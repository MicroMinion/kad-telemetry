'use strict'

var expect = require('chai').expect
var Metric = require('../lib/metric')
var Profile = require('../lib/profile')

describe('Metric', function () {

  describe('@constructor', function () {

    it('should create an instance without the new keyword', function () {
      expect(Metric()).to.be.instanceOf(Metric)
    })

    it('should create an instance with the new keyword', function () {
      expect(new Metric()).to.be.instanceOf(Metric)
    })

    it('should set the default properties', function () {
      var m = new Metric()
      expect(m.key).to.equal(null)
      expect(Array.isArray(m.hooks)).to.equal(true)
    })

  })

  describe('#setMetric', function () {

    it('should throw with an invalid profile', function () {
      expect(function () {
        var m = new Metric()
        m.setMetric({}, 1)
      }).to.throw(Error, 'Invalid profile supplied')
    })

    it('should set the value to the correct property', function () {
      var m = new Metric()
      var p = new Profile()
      m.key = 'test'
      m.setMetric(p, 1)
      expect(p.metrics.test).to.equal(1)
    })

  })

  describe('#getMetric', function () {

    it('should throw with an invalid profile', function () {
      expect(function () {
        var m = new Metric()
        m.getMetric({})
      }).to.throw(Error, 'Invalid profile supplied')
    })

    it('should get the value from the correct property', function () {
      var m = new Metric()
      var p = new Profile({ metrics: { test: 1 } })
      m.key = 'test'
      expect(m.getMetric(p)).to.equal(1)
    })

    it('should get the default value if not set', function () {
      var m = new Metric()
      var p = new Profile()
      m.key = 'test'
      m.default = [1]
      expect(m.getMetric(p)[0]).to.equal(1)
    })

  })

})

describe('Metric#score', function () {

  it('should return the default score', function () {
    expect(Metric.score('test')).to.equal(0)
  })

  it('should throw without a value', function () {
    expect(function () {
      Metric.score()
    }).to.throw(Error, 'Missing param `a`')
  })

})
