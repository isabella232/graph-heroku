<!-- markdownlint-disable MD024-->

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Added fetch-team-apps step
- Added build-team-to-app-mapping step

### Fixed

- Centralized project's API documentation in `src/heroku.ts`

## [0.0.1] - 2020-04-24

### Added

- Added documentation about setup, entity and relationship ingestion, and this
  CHANGELOG
- Added mapping steps for account->user relationships and team->user
  relationships

## [Unversioned]

- Created initial project structure, based on the
  [integration sdk template](https://github.com/JupiterOne/integration-sdk/tree/master/template)
- Added provider setup to fetch data using the
  [Heroku Node Client](https://github.com/heroku/node-heroku-client)
- Added account, team, and user entities
- Added account-> team relationship

[unreleased]: https://github.com/JupiterOne/graph-heroku/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/JupiterOne/graph-heroku/releases/tag/v0.0.1
