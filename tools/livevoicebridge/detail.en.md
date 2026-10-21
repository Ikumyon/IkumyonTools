<!-- i18n:overview -->
## Overview

**LiveVoiceBridge** is a desktop app that retrieves live stream comments, including YouTube Live chat, and reads them aloud. Combine speech controls, sound effects, and pronunciation dictionaries for your stream.

<!-- i18n:features -->
## Features

- Supports VOICEVOX, COEIROINK, Bouyomi-chan, Supertonic, and Supertonic Lightweight.
- Change speed, volume, pitch, and speaker through comment commands.
- Play sound effects and apply echo, repeated delays, and stereo panning.
- Edit pronunciation dictionaries and import JSON, CSV, or tab-separated TXT dictionaries.
- Pop out the comment list as a translucent, always-on-top PiP window.
- Reduce repeated synthesis with voice caching based on usage frequency.
- Test speech locally without connecting to a live stream.

<!-- i18n:requirements -->
## Requirements and initial setup

The Windows executable is `LiveVoiceBridge.exe`. The Windows build is the `v0.99.0` prerelease.

Set a YouTube Data API v3 key to connect to YouTube. VOICEVOX, COEIROINK, and Bouyomi-chan require a running engine and connection settings. Supertonic engines require the appropriate models. Review the in-app terms for model and voice assets.

<!-- i18n:usage -->
## Getting started

1. Open settings and configure your YouTube API key, TTS engine, connection details, or model.
2. Enter a stream URL or video ID and start to retrieve and read comments.
3. To test locally, enter `debug`, start, and use the test-send button to submit text.
4. Use the PiP button to detach the comment list. Stop when you finish reading comments.

<!-- i18n:commands -->
## Comment commands

- Update the comment dictionary with `教育(単語=よみがな)` and `忘却(単語)`.
- Play files in `sounds/` with commands such as `再生(warning.wav)` or `sound(cheer.wav)`.
- `速度(120)` sets 1.2× speed and `音量(80)` sets volume to 80%.
- Change speakers with `声(数値)` and apply effects with `エコー(50)` or `やまびこ(50)`.
- Pan audio with `左)`, `右)`, and `両)`.

<!-- i18n:guide -->
## User guide and source code

See the [usage manual](https://github.com/Ikumyon/LiveVoiceBridge/blob/main/docs/usage.md) for detailed settings and operations. Running from source uses Python 3.11 or later and a Rust extension. Setup instructions are in the [development guide](https://github.com/Ikumyon/LiveVoiceBridge/blob/main/docs/development.md), with feature details in the [project README](https://github.com/Ikumyon/LiveVoiceBridge/blob/main/README.md).
