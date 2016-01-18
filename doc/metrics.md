Module: metrics
===============

The metrics module provides a number of simple measurements for node
performance and hooks for use with a `TelemetryTransport` created by using the
[`TransportDecorator`](transport-decorator.md).

Metrics are defined by inheriting from `Metric` and overriding the default
values for the following properties:

* `key` (String) - the name that identifies this metric in a [`Profile`](profile.md)
* `default` (Array) - placeholder for the measurement values
* `hooks` (Array) - hook specification object for binding to a transport

In addition, the constructor must implement a static `score(value)` method for
generating a score based on the stored measurements.

### Hook Specification

A hook specification is an object that contains the following values:

* `trigger` (String) - one of "before" or "after"
* `event` (String) - the event name for transport hook (i.e. "send" or "receive")
* `handler` (Function) - function that receives (self, persistence) and returns a hook function

Class: AvailabilityMetric
-------------------------

Measures availability in terms of `requestsSent / responsesReceived` to infer
the probability that a node will respond to a request.

Class: ReliabilityMetric
------------------------

Measures reliability in terms of `successResponses / totalResponses` to infer
the probability that a given request will yield a successful response.

Class: LatencyMetric
--------------------

Measures latency in terms of the length of time it took to receive a response
to the last request sent, which is scored by subtracting the latency from the
maximum time we wait for a response and dividing the result by that same
maximum time.

Class: ThroughputMetric
-----------------------

Measures throughput in terms of bytes per second by dividing the average packet
size by the average response time. This metric is used as a "tie-breaker"
when two nodes are within a score threshold of 0.05.
