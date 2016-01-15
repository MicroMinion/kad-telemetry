/**
 * @class kad-telemetry/metrics/availability
 */

'use strict';

var Message = require('kad').Message;
var inherits = require('util').inherits;
var Metric = require('../metric');

/**
 * Defines a metric that measures availability by number of requests/responses
 * @constructor
 */
function AvailabilityMetric() {
  if (!(this instanceof AvailabilityMetric)) {
    return AvailabilityMetric();
  }

  Metric.call(this);

  this.key = 'availability';
  this.hooks = [
    { trigger: 'before', event: 'send',    handler: this._start },
    { trigger: 'before', event: 'receive', handler: this._stop  }
  ];
}

inherits(AvailabilityMetric, Metric);

/**
 * Begins the Availability test
 * #_start
 * @param {telemetry.metrics.AvailabilityMetric} self
 * @param {telemetry.Persistence} profiles
 * @returns {Function}
 */
AvailabilityMetric.prototype._start = function(self, profiles) {
  return function(buffer, contact, next) {
    var message = Message.fromBuffer(buffer);
    var profile = profiles.getProfile(contact);
    var metric = self.getMetric(profile) || [0, 0];

    if (Message.isRequest(message)) {
      metric[0]++;
      self.setMetric(profile, metric);
      profiles.setProfile(contact, profile);
    }

    next();
  };
};

/**
 * Ends the Availability test
 * #_stop
 * @param {telemetry.metrics.AvailabilityMetric} self
 * @param {telemetry.Persistence} profiles
 * @returns {Function}
 */
AvailabilityMetric.prototype._stop = function(self, profiles) {
  return function(message, contact, next) {
    var profile = profiles.getProfile(contact);
    var metric = self.getMetric(profile) || [0, 0];

    if (Message.isResponse(message)) {
      metric[1]++;
      self.setMetric(profile, metric);
      profiles.setProfile(contact, profile);
    }

    next();
  };
};

module.exports = AvailabilityMetric;