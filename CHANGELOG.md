# Changelog

All notable changes to this integration are documented in this file. The format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project
uses [semantic versioning](https://semver.org/).

## [Unreleased]

## [1.0.1] - 2026-11-18

### Added

- EJP device: EJP day today and tomorrow (0/1 and readable state), EJP days left.
- PP device: PP peak day today and tomorrow (0/1 and readable state), PP days left.
- Optional Tempo device: red/white day alerts, colour today and tomorrow, days left.
- Stale data (past the API `perime_apres` date): binary sensors at 0, texts at "Inconnu".

[Unreleased]: https://github.com/jourtempo/gladys-jourtempo/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/jourtempo/gladys-jourtempo/releases/tag/v1.0.1
