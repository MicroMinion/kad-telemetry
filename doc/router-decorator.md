Decorator: RouterDecorator(ChildRouter)
=======================================

Returns a `TelemetryRouter` constructor that can be used in place of the
default `kad.Router` that embellishes the `getNearestContacts()` method
with additional node sorting based upon the collected metrics for those
nodes.

## Usage Example

```js
var kad = require('kad');
var telemetry = require('kad-telemetry');

var TelemetryRouter = telemetry.RouterDecorator(kad.Router);

var router = new TelemetryRouter({
  transport: transport // must be a TelemetryTransport
});

var node = new kad.Node({
  transport: transport,
  router: router,
  storage: kad.storage.FS('path/to/storage')
});
```
