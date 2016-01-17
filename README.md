Kad Telemetry
=============

[![Build Status](https://img.shields.io/travis/kadtools/kad-telemetry.svg?style=flat-square)](https://travis-ci.org/kadtools/kad-telemetry)
[![Coverage Status](https://img.shields.io/coveralls/kadtools/kad-telemetry.svg?style=flat-square)](https://coveralls.io/r/kadtools/kad-telemetry)
[![NPM](https://img.shields.io/npm/v/kad-telemetry.svg?style=flat-square)](https://www.npmjs.com/package/kad-telemetry)

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
[transport adapter](https://github.com/kadtools/kad/blob/master/doc/rpc.md).

```js
// Import dependencies
var kad = require('kad');
var telemetry = require('kad-telemetry');

// Decorate your transport adapter
var TelemetryTransport = telemetry.TransportDecorator(kad.transports.UDP);

// Create your transport instance
var transport = new TelemetryTransport(contact, {
  telemetry: { filename: 'path/to/telemetry.data' }
});
```

You might also like to extend Kad's peer selection by scoring peers based on
the collected metrics by decorating your
[router](https://github.com/kadtools/kad/blob/master/doc/router.md).

```js
// Decorate the default router
var TelemetryRouter = telemetry.RouterDecorator(kad.Router);

// Create your router instance
var router = new TelemetryRouter({ transport: transport });
```

Then create your Kad node and party.

```js
// Create your node
var dht = new kad.Node({
  router: router,
  transport: transport,
  storage: kad.storage.FS('...')
});
```

Once you have been connected to the network, you can lookup a node's profile.

```js
transport.telemetry.getProfile(contact);
// Example profile:
// This node has a ping of 54ms and has responded to 5 of 6 requests
//  { metrics: { latency: 54, availability: [6, 5] } }
```
