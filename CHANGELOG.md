# Changelog

All notable changes to the Entity Resolution Service Webapp are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [1.1.0] - 2026-05-15

### Added
- Bulk accept and reject for curation decisions with per-item result breakdown
- Session-based preference to skip confirmation dialogs for accept/reject actions
- Discovery-driven display names sourced from the `/entity-types` endpoint

### Changed
- Friendly 5xx error notifications replace raw HTTP error messages
- Decision list sorted by Updated At in descending order
- Aligned comparison rows for improved visual consistency
- Application name updated to match ERSys branding

### Fixed
- New API error message shape (`message` field) handled correctly across all error paths
- Friendly connectivity error messages shown on backend unavailability

## [1.0.0] - 2026-04-21

### Added
- Initial release of the Entity Resolution Service Webapp
- Curation interface for human-in-the-loop entity decision review
- Accept and reject actions for individual curation decisions
- Role-based user management and user action audit log
- User search by email
