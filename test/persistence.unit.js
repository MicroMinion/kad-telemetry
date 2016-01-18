'use strict';

var proxyquire = require('proxyquire');
var sinon = require('sinon');
var expect = require('chai').expect;
var Persistence = require('../lib/persistence');
var Profile = require('../lib/profile');

describe('Persistence', function() {

  var mocks = function() {
    return {
      fs: {
        existsSync: sinon.stub().returns(false),
        writeFileSync: sinon.stub(),
        readFileSync: sinon.stub().returns(
          JSON.stringify(Persistence.DEFAULTS)
        ),
        statSync: sinon.stub().returns({
          isDirectory: sinon.stub().returns(false)
        })
      }
    };
  };

  describe('@constructor', function() {

    it('should throw with missing filename', function() {
      expect(function() {
        Persistence();
      }).to.throw(Error, 'A filename was not supplied');
    });

    it('should throw with empty string', function() {
      expect(function() {
        Persistence('');
      }).to.throw(Error, 'Invalid filename');
    });

    it('should throw if filename is a directory', function() {
      var Persistence = proxyquire('../lib/persistence', {
        fs: {
          existsSync: sinon.stub().returns(true),
          statSync: sinon.stub().returns({
            isDirectory: sinon.stub().returns(true)
          })
        }
      });
      expect(function() {
        Persistence('test.data');
      }).to.throw(Error, 'Cannot use a directory');
    });

    it('should write the file if it does not exist', function() {
      var Persistence = proxyquire('../lib/persistence', mocks());
      expect(typeof Persistence('test.data')._data).to.equal('object');
    });

    it('should create an instance without the new keyword', function() {
      var Persistence = proxyquire('../lib/persistence', mocks());
      expect(Persistence('test.data')).to.be.instanceOf(Persistence);
    });

    it('should create an instance with the new keyword', function() {
      var Persistence = proxyquire('../lib/persistence', mocks());
      expect(new Persistence('test.data')).to.be.instanceOf(Persistence);
    });

  });

  describe('#getProfile', function() {

    it('should return a Profile', function() {
      var Persistence = proxyquire('../lib/persistence', mocks());
      expect(Persistence('test.data').getProfile({})).to.be.instanceOf(Profile);
    });

  });

  describe('#setProfile', function() {

    it('should throw with invalid profile', function() {
      var Persistence = proxyquire('../lib/persistence', mocks());
      var p = Persistence('test.data');
      expect(function() {
        p.setProfile({ nodeID: 'test' }, {});
      }).to.throw(Error, 'Invalid profile supplied');
    });

    it('should set the contact profile', function() {
      var Persistence = proxyquire('../lib/persistence', mocks());
      var p = Persistence('test.data');
      var prof = Profile();
      p.setProfile({ nodeID: 'test' }, prof);
      expect(p._data.profiles.test).to.equal(prof);
    });

  });

  describe('#saveState', function() {

    it('should write the telemetry data to disk', function() {
      var m = mocks();
      var Persistence = proxyquire('../lib/persistence', m);
      var p = Persistence('test.data');
      p.saveState();
      expect(m.fs.writeFileSync.calledWith(
        p._filename,
        JSON.stringify(p._data)
      )).to.equal(true);
    });

  });

  describe('#loadState', function() {

    it('should return a copy of the internal data', function() {
      var Persistence = proxyquire('../lib/persistence', mocks());
      var p = Persistence('test.data');
      var state = p.loadState();
      expect(JSON.stringify(state)).to.equal(JSON.stringify(p._data));
    });

  });

});
