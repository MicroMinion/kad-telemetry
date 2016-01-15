Kad Telemetry
=============

Framework for analyzing network behavior and performance for
[Kad](https://github.com/kadtools/kad).

Installation
------------

```
npm install kad-telemetry --save
```

Quick Start
-----------

Decorate your
[transport adapter](https://github.com/kadtools/kad/blob/master/doc/rpc.md)
and optionally supply it with some [metrics](doc/metrics.md) (defaults to all).

```js
// Import dependencies
var kad = require('kad');
var telemetry = require('kad-telemetry');

// Decorate your transport adapter
var TelemetryTransport = telemetry.TransportDecorator(kad.transports.UDP);

// Create your transport instance
var transport = new TelemetryTransport(contact, {
  telemetry: {
    filename: 'path/to/telemetry.data', // Created if it doesn't exist
    metrics: [
      telemetry.metrics.Availability,
      telemetry.metrics.Latency
    ]
  }
});

// Create your node
var dht = new kad.Node({
  transport: transport,
  storage: kad.storage.FS('...')
});
```
