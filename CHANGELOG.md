# Changelog

All notable changes to the **Fahh Sound Extension** are documented here.

This project follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format
and [Semantic Versioning](https://semver.org/).

---

## [0.0.2] - 2025-03-11

### Added
- `fahh.toggle` command — enable/disable from command palette or status bar click
- `fahh.setCooldown` command — set cooldown duration interactively
- `fahh.addPattern` command — add custom error patterns without editing settings
- `fahh.removePattern` command — remove patterns via QuickPick menu
- `fahh.listPatterns` command — view all active patterns in a QuickPick list
- `fahh.resetPatterns` command — restore default patterns with confirmation dialog
- Settings via `contributes.configuration`:
  - `fahh.enabled` — toggle sounds on/off
  - `fahh.cooldownMs` — configurable cooldown (default 2000ms)
  - `fahh.errorPatterns` — customizable pattern list
  - `fahh.soundFile` — custom sound file path
  - `fahh.showStatusBarMessage` — toggle status bar notification
- Status bar item is now **clickable** (toggles extension on/off)
- Status bar icon switches between `$(bell)` and `$(bell-slash)` based on state
- Config change listener keeps status bar in sync when settings file is edited directly
- Windows sound playback fixed: now uses `System.Windows.Media.MediaPlayer` instead of `SoundPlayer` (which only supported `.wav`)
- Sound playback errors now surface as VS Code notifications instead of silent failures

### Changed
- All runtime values now read live from settings — no stale in-memory state
- `playErrorSoundSafe` respects both `fahh.enabled` and `fahh.cooldownMs`
- Renamed command IDs from `extension.*` to `fahh.*` for consistency

### Fixed
- Windows `.mp3` playback was broken with the old `SoundPlayer` approach
- Cooldown was checked before sound, could cause skipped alerts on rapid errors

---

## [0.0.1] - 2025-01-01

### Added
- Initial release
- Plays `error-sound.mp3` when terminal output matches error patterns
- Cross-platform support: Windows (PowerShell), macOS (afplay), Linux (mpg123/ffplay)
- 2-second hardcoded cooldown to prevent sound spam
- Status bar item showing extension is active
- `Fahh: Show Status` command
- `Fahh: Test Sound` command
- Default error patterns: `error`, `failed`, `fatal`, `exception`, `traceback`,
  `npm err`, `segmentation fault`, `panic`, `cannot find`, `not found`, `module not found`