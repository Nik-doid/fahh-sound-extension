# 🔔 faaaahh Sound Extension

A VS Code extension that plays a sound whenever an error is detected in your terminal — so you don't have to stare at the screen waiting for something to break.

---

## ✨ Features

- 🔊 Plays an audio alert when error patterns appear in terminal output
- 🔕 Toggle sounds on/off directly from the status bar or command palette
- ⚙️ Fully configurable error patterns, cooldown duration, and sound file
- 🖥️ Cross-platform support: Windows, macOS, and Linux
- 🧪 Test sound playback from the command palette without triggering an error

---

## 📋 Requirements

### macOS
No extra dependencies — uses the built-in `afplay` command.

### Windows
No extra dependencies — uses PowerShell's `System.Windows.Media.MediaPlayer`.

### Linux
Requires one of the following audio players to be installed:

```bash
# Option 1
sudo apt install mpg123

# Option 2
sudo apt install ffmpeg
```

---

## 🚀 Getting Started

1. Install the extension from the `.vsix` file:
   ```
   Extensions panel → ··· menu → Install from VSIX
   ```
2. Open a terminal in VS Code and run any command that produces an error.
3. You'll hear the alert sound and see a brief status bar notification.

---

## 🎛️ Commands

All commands are accessible via the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

| Command | Description |
|---|---|
| `faaaahh: Show Status` | Display current state (enabled, cooldown, pattern count) |
| `faaaahh: Test Sound` | Play the alert sound immediately to verify setup |
| `faaaahh: Toggle Error Sounds On/Off` | Enable or disable the extension |
| `faaaahh: Set Cooldown Duration` | Set minimum ms between consecutive sounds |
| `faaaahh: Add Custom Error Pattern` | Add a new terminal pattern to watch for |
| `faaaahh: Remove Error Pattern` | Remove a pattern from the watch list |
| `faaaahh: List Active Error Patterns` | View all currently active patterns |
| `faaaahh: Reset Patterns to Default` | Restore the default error pattern list |

---

## ⚙️ Configuration

All settings can be changed via `File → Preferences → Settings` and searching for **faaaahh**.

| Setting | Type | Default | Description |
|---|---|---|---|
| `faaaahh.enabled` | boolean | `true` | Enable or disable sound alerts |
| `faaaahh.cooldownMs` | number | `2000` | Min ms between sounds (500–30000) |
| `faaaahh.errorPatterns` | string[] | See below | Terminal patterns that trigger a sound |
| `faaaahh.soundFile` | string | `""` | Absolute path to a custom `.mp3` or `.wav` file |
| `faaaahh.showStatusBarMessage` | boolean | `true` | Show a message in status bar on detection |

### Default Error Patterns

```json
[
  "error", "failed", "fatal", "exception",
  "traceback", "npm err", "segmentation fault",
  "panic", "cannot find", "not found", "module not found"
]
```

### Custom Sound File Example

```json
{
  "faaaahh.soundFile": "/Users/yourname/sounds/alert.mp3"
}
```

---

## 🔔 Status Bar

The status bar item in the bottom-right shows:

- `🔔 faaaahh` — sounds are **enabled**
- `🔕 faaaahh` — sounds are **disabled**

Click it to instantly toggle on/off.

---

## 🗂️ Project Structure

```
faaaahh-sound-extension/
├── assets/
│   ├── error-sound.mp3       ← Default sound (add your own here)
│   └── error-sound.wav       ← WAV fallback (optional)
├── src/
│   └── extension.ts          ← Main extension source
├── out/
│   └── extension.js          ← Compiled output (auto-generated)
├── .vscodeignore
├── CHANGELOG.md
├── LICENSE
├── package.json
├── README.md
└── tsconfig.json
```

---

## 🔧 Building from Source

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode (auto-recompile on save)
npm run watch

# Package as .vsix
npm install -g @vscode/vsce
vsce package
```

---

## 🐛 Known Issues

- On **Linux**, the extension requires `mpg123` or `ffmpeg` to be installed. If neither is present, no sound will play and an error will be logged to the console.
- On **Windows**, sounds may have a short startup delay due to PowerShell MediaPlayer initialization.
- The terminal stream reader requires VS Code **1.93+** for the `onDidStartTerminalShellExecution` API. Earlier versions are not supported.

---

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.

---

## 📄 License

[MIT](./LICENSE) © 2025 miunin