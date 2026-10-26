<!-- i18n:overview -->
## Overview

**LiveVoiceBridge** is a Windows and Linux desktop app that retrieves YouTube Live chat in real time and reads it aloud. Combine speech controls, sound effects, and pronunciation dictionaries with comment display and system monitoring in the same app.

<!-- i18n:features -->
## Features

- Supports VOICEVOX, COEIROINK, and Qwen3-TTS, plus Bouyomi-chan on Windows.
- Add TTS plugins and enable or disable them in settings.
- Change speed, volume, pitch, and speaker through comment commands. Supported controls vary by engine.
- Play sound effects and apply echo, repeated delays, and stereo panning.
- Manage pronunciation dictionary groups and import JSON, CSV, or tab-separated TXT dictionaries.
- Combine and reorder author names, message text, and fixed text for speech.
- Configure whether to read chat history and events such as Super Chats and membership notifications.
- Pop out the comment list as a translucent, always-on-top PiP window.
- Monitor CPU, RAM, network activity, and detected GPUs, and display metrics in PiP.
- Test speech without connecting to a live stream.

<!-- i18n:requirements -->
## Requirements and initial setup

Available for Windows and Linux x64. Extract the entire distribution folder for your OS, then run `LiveVoiceBridge.exe` on Windows or `LiveVoiceBridge` on Linux. Keep `_internal/` alongside the executable. The installation folder must be writable.

Set a YouTube Data API v3 key to connect to YouTube. VOICEVOX, COEIROINK, and Bouyomi-chan require an external engine. Connect to a running engine or specify its executable path to launch it from the app.

Settings, dictionaries, sound effects, and the dedicated Qwen environment are stored in `data/` within the installation folder. Back up the entire folder after closing the app.

<!-- i18n:qwen -->
## Preparing Qwen3-TTS

Select Qwen3 in the speech synthesis settings and open model preparation to download a model or select a local model folder. The supported model is `Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice`. Choose GPU or CPU for setup. Downloading the environment and model initially requires an internet connection; speech generation works offline after preparation.

Qwen3 supports speaker selection, volume, and shared audio effects. Speed and pitch adjustments are unavailable. See the [Qwen3-TTS setup guide](https://github.com/Ikumyon/LiveVoiceBridge/blob/main/docs/users/qwen3.md) for details.

<!-- i18n:usage -->
## Getting started

1. Open settings, configure your YouTube API key, speech engine, connection details, and speaker, then save with OK. Prepare the model as well when using Qwen3.
2. Enter a stream URL or video ID and press the connect button to retrieve and read comments.
3. To test locally, use the test-send button to enter text without connecting to a stream. This does not post to YouTube.
4. Use the PiP button to detach the comment list. Stop when you finish reading comments.

<!-- i18n:commands -->
## Comment commands

- Update the comment dictionary with `教育(単語=よみがな)` and `忘却(単語)`.
- Play files in `data/sounds/` with commands such as `再生(warning.wav)` or `sound(cheer.wav)`.
- `速度(120)` sets 1.2× speed and `音量(80)` sets volume to 80%.
- Change speakers with `声(数値)` and apply effects with `エコー(50)` or `やまびこ(50)`.
- Pan audio with `左)`, `右)`, and `両)`.

Speech controls apply to the rest of the same comment after the command and do not carry over to the next comment. Available controls depend on the engine.

<!-- i18n:plugins -->
## TTS plugins

Place each external plugin folder in `plugins/` directly under the app folder. Enable it in the plugin settings, save, and restart the app to select it in the speech synthesis settings. Adding, removing, enabling, or disabling plugins takes effect after a restart.

See the [TTS plugin guide](https://github.com/Ikumyon/LiveVoiceBridge/blob/main/docs/plugins/README.md) for installation details.

<!-- i18n:guide -->
## User guide and source code

See [installation and usage](https://github.com/Ikumyon/LiveVoiceBridge/blob/main/docs/users/README.md) for detailed settings and operations, and the [pronunciation dictionary guide](https://github.com/Ikumyon/LiveVoiceBridge/blob/main/docs/users/dictionary.md) for dictionary management. Running from source uses standard CPython 3.14 or later and a Rust extension. Setup instructions are in the [development guide](https://github.com/Ikumyon/LiveVoiceBridge/blob/main/docs/source/development.md), with an overview of all documentation in the [documentation index](https://github.com/Ikumyon/LiveVoiceBridge/blob/main/docs/README.md).
