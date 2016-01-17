/**
 * @class kad-telemetry/persistence
 */

'use strict';

var assert = require('assert');
var fs = require('fs');
var Profile = require('./profile');

/**
 * Represents a persisted dataset of `Profile`s
 * @constructor
 * @param {String} filename
 */
function Persistence(filename) {
  if (!(this instanceof Persistence)) {
    return new Persistence(filename);
  }

  assert(typeof filename === 'string', 'A filename was not supplied');
  assert(filename.length, 'Invalid filename');

  if (!fs.existsSync(filename)) {
    fs.writeFileSync(filename, JSON.stringify(Persistence.DEFAULTS));
  }

  assert(!fs.statSync(filename).isDirectory(), 'Cannot use a directory');

  this._filename = filename;
  this._data = JSON.parse(fs.readFileSync(filename));
}

Persistence.DEFAULTS = {
  profiles: {}
};

/**
 * Returns the profile at the given nodeID or an empty profile
 * #getProfile
 * @param {kad.Contact} contact
 * @returns {telemetry.Profile}
 */
Persistence.prototype.getProfile = function(contact) {
  return new Profile(this._data.profiles[contact.nodeID]);
};

/**
 * Updates the profile at the given nodeID and saves
 * #setProfile
 * @param {kad.Contact} contact
 * @param {telemetry.Profile} profile
 */
Persistence.prototype.setProfile = function(contact, profile) {
  assert(profile instanceof Profile, 'Invalid profile supplied');
  this._data.profiles[contact.nodeID] = profile;
  this.saveState();
};

/**
 * Encodes and lazy saves the data back to disk
 * #saveState
 */
Persistence.prototype.saveState = function() {
  fs.writeFileSync(this._filename, JSON.stringify(this._data));
};

/**
 * Returns a clone of the current state
 * #getState
 */
Persistence.prototype.getState = function() {
  return Object.create(this._data);
};


module.exports = Persistence;
