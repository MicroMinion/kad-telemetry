/**
 * @class kad-telemetry/metrics/throughput
 */

'use strict';

var Message = require('kad').Message;
var inherits = require('util').inherits;
var LatencyMetric = require('./latency');

/**
 * Defines a metric that measures bytes/ms
 * @constructor
 */
function ThroughputMetric() {
  if (!(this instanceof ThroughputMetric)) {
    return ThroughputMetric();
  }

  LatencyMetric.call(this);

  this.key = 'throughput';
  this.default = [0, 0, 0]; // [totalResponses, totalResponseBytes, timeWaiting]
}

inherits(ThroughputMetric, LatencyMetric);

ThroughputMetric.TEST_TIMEOUT = 5000; // 5 seconds

/**
 * Begins the throughput test
 * #_start
 * @param {telemetry.metrics.LatencyMetric} self
 * @param {telemetry.Persistence} profiles
 * @returns {Function}
 */
ThroughputMetric.prototype._start = function(self) {
  return function(buffer, contact, next) {
    var message = Message.fromBuffer(buffer);

    if (Message.isResponse(message)) {
      return next();
    }

    self._tests[message.id] = Date.now();

    next();
  };
};

/**
 * Ends the throughput test
 * #_stop
 * @param {telemetry.metrics.LatencyMetric} self
 * @param {telemetry.Persistence} profiles
 * @returns {Function}
 */
ThroughputMetric.prototype._stop = function(self, profiles) {
  return function(message, contact, next) {
    var profile = profiles.getProfile(contact);
    var metric = self.getMetric(profile);

    if (Message.isRequest(message) || !self._tests[message.id]) {
      return next();
    }

    // Increment number of responses
    metric[0]++;
    // Increment the response bytes
    metric[1] += message.serialize().length;
    // Increment time waiting
    metric[2] += (Date.now() - self._tests[message.id]);

    self.setMetric(profile, metric);
    profiles.setProfile(contact, profile);
    next();
  };
};

/**
 * Returns the score for a given metric value
 * #score
 * @param {Array} value
 * @returns {Number}
 */
ThroughputMetric.score = function(value) {
  return (value[1] / value[0]) / (value[2] / value[0]);
};

module.exports = ThroughputMetric;
