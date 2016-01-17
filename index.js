/**
 * @module kad-telemetry
 */

'use strict';

module.exports = {
  TransportDecorator: require('./lib/transport-decorator'),
  RouterDecorator: require('./lib/router-decorator'),
  Profile: require('./lib/profile'),
  Persistence: require('./lib/persistence'),
  Metric: require('./lib/metric'),
  metrics: require('./lib/metrics')
};
