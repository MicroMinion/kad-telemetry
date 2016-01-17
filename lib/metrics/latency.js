/**
 * @class kad-telemetry/metrics/latency
 */

'use strict';

var Message = require('kad').Message;
var inherits = require('util').inherits;
var Metric = require('../metric');

/**
 * Defines a metric that measures latency by last req/res
 * @constructor
 */
function LatencyMetric() {
  if (!(this instanceof LatencyMetric)) {
    return LatencyMetric();
  }

  Metric.call(this);

  this.key = 'latency';
  this.hooks = [
    { trigger: 'before', event: 'send',    handler: this._start },
    { trigger: 'before', event: 'receive', handler: this._stop  }
  ];

  this._tests = {};

  this._startTestExpiration();
}

inherits(LatencyMetric, Metric);

LatencyMetric.TEST_TIMEOUT = 5000; // 5 seconds

/**
 * Begins the latency test
 * #_start
 * @param {telemetry.metrics.LatencyMetric} self
 * @param {telemetry.Persistence} profiles
 * @returns {Function}
 */
LatencyMetric.prototype._start = function(self) {
  return function(buffer, contact, next) {
    var message = Message.fromBuffer(buffer);

    if (Message.isRequest(message)) {
      self._tests[message.id] = {
        started: Date.now()
      };
    }

    next();
  };
};

/**
 * Ends the latency test
 * #_stop
 * @param {telemetry.metrics.LatencyMetric} self
 * @param {telemetry.Persistence} profiles
 * @returns {Function}
 */
LatencyMetric.prototype._stop = function(self, profiles) {
  return function(message, contact, next) {
    var profile = profiles.getProfile(contact);

    if (Message.isRequest(message)) {
      return next();
    }

    var test = self._tests[message.id];

    if (test) {
      self.setMetric(profile, Date.now() - test.started);
      profiles.setProfile(contact, profile);
    }

    next();
  };
};

/**
 * Starts an interval of checking for expired tests and cleaning up
 * #_startTestExpiration
 */
LatencyMetric.prototype._startTestExpiration = function() {
  var self = this;

  setInterval(function() {
    for (var id in self._tests) {
      if (Date.now() > self._tests[id].started + LatencyMetric.TEST_TIMEOUT) {
        delete self._tests[id];
      }
    }
  }, LatencyMetric.TEST_TIMEOUT);
};

/**
 * Returns the score for a given metric value
 * #score
 * @param {Array} value
 * @returns {Number}
 */
LatencyMetric.score = function(value) {
  return (LatencyMetric.TEST_TIMEOUT - value) / LatencyMetric.TEST_TIMEOUT;
};

module.exports = LatencyMetric;
