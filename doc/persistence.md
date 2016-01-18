Class: Persistence(filename)
===========================

Provides an interface for storing and loading node telemetry data from disk.

## persistence.getProfile(contact)

Returns the telemetry [`Profile`](profile.md) for the given `kad.Contact`.

## persistence.setProfile(contact, profile)

Stores the given [`Profile`](profile.md) for the given `kad.Contact`.

## persistence.saveState()

Writes the current network profile to disk. Called automatically on
`setProfile()`.

## persistence.loadState()

Returns the raw telemetry data for the network as an object.
