## ADDED Requirements

### Requirement: Storage utility module
The system SHALL provide a storage utility module (src/utils/storage.js) with get/set/remove methods that handle JSON serialization and localStorage errors gracefully.

#### Scenario: Read existing value
- **WHEN** storage.get('key') is called and 'key' exists in localStorage
- **THEN** the value is parsed from JSON and returned

#### Scenario: Read missing value with default
- **WHEN** storage.get('key', defaultValue) is called and 'key' does not exist
- **THEN** defaultValue is returned

#### Scenario: Write value
- **WHEN** storage.set('key', value) is called
- **THEN** value is serialized to JSON and stored in localStorage under 'key'

#### Scenario: Storage unavailable
- **WHEN** localStorage throws an exception (quota exceeded, private mode)
- **THEN** the error is caught silently, get returns defaultValue, set does nothing
