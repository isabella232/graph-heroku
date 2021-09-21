<!-- markdownlint-disable MD024-->

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Upgrade dependencies
- Additional logging in `fetch-app-addons` step

## 2.2.0 - 2021-07-12

### Changed

- Upgraded `@jupiterone/integration-sdk-*@6.10.0`

### Changed

- Added note to published doc that Heroku Enterprise is required

## [0.2.0] - 2020-04-27

### Added

- Added fetch-app-addons and build-app-to-addon-mapping

## [0.1.0] - 2020-04-24

### Added

- Added fetch-team-apps step
- Added build-team-to-app-mapping step
- Added gitleaks workflow

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

[unreleased]: https://github.com/JupiterOne/graph-heroku/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/JupiterOne/graph-heroku/releases/tag/v0.1.0
[0.0.1]: https://github.com/JupiterOne/graph-heroku/releases/tag/v0.0.1
