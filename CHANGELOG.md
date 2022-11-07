# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [unreleased] - 2022-11-07

Rebase recent development with some updates, including:

- Add a brand new application logo
- Major UI updates to make everything looks better
- Major rewrite on code logic to make it more modular

See below for more details.

### Added

- Object to record user secrets
- Modal for information pop-up
- File thumbnail display on the pop-up modal for file upload and download
- Add notification for some actions (transfer in progress, transfer complete, upload file, etc.)
- Homemade application logo
- Add a link to the project source code

### Changed

- Improve UI for the small screen
- Improve color scheme, add auto-adjusted light/dark mode
- Fix typos and improve variables' readabilities
- Improve program description
- Update GPLv3 notice
- Disable drop zone when no peer
- Rewrite file transfer to include more information
- Update the "title" attribute for all buttons
- Update README.md and add a "known issues" section

### Removed

- Remove unnecessary packages
- Remove unnecessary HTML elements
- Remove file thumbnail display on the drop zone

## [0.0.1] - 2022-10-15

Clean up all previous commits. Release again with all the loveable features.

### Added

- CHANGELOG.md to track project changes

## [pre-release] - 2022-09-23

First build with all bare-bone features.

### Added

- Minimalist UI/UX design
- WebRTC data transfer
- Peer-to-peer file transfer with multiple peers
- Peer-based file encryption/decryption
- Local file encryption/decryption
- Local key derivation

### Changed

- Add more details about project in README.md

## [pre-release] - 2022-09-19

Initialize project, create file-sharing program built with security in mind.

### Added

- Project introduction in README.md
- Add .gitignore file
- Release under GPLv3
