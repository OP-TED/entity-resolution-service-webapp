# Changelog

All notable changes to the Entity Resolution Service Webapp are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]


## [1.1.0-rc.4] - 2026-06-30

### Changed
* Dockerfile updated to use fully qualified Docker Hub reference for the Python base image


## [1.1.0-rc.3] - 2026-06-10

### Added
- Review-status filter on the decision list (Never reviewed / Needs re-review / Reviewed)
- "Reviewed" and "Needs re-review" badges on list items and detail view
- Entity metadata popover (source ID, request ID, entity type) per cluster member and current entity
- Contextual explanation messages when a decision needs re-review
- Apache 2.0 LICENSE file and attribution to the Publications Office of the EU

### Changed
- Decision list sorted by cluster size
- Review state derived from live API fields so a page refresh reflects the current filter and indicators
- Numeric confidence score always rendered (shows `0.00` instead of blank or N/A)
- Current and Proposed attribute panes use unified wrapping and flex-fill card bodies
- User-row deactivation action relabelled to "Deactivate user" with a non-destructive icon
- Dockerfile schema URL and npm `openapi:generate` script updated to OP-TED organisation

### Fixed
- Inactive or unverified accounts blocked at login with a clear inline alert; blocked sessions are not silently restored on bootstrap
- True cluster size shown in the detail header; proposed-pane member count labelled as "Entity X of Y loaded entities"

## [1.1.0-rc.2] - 2026-05-15

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
