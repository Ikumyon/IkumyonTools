<!-- i18n:overview -->
## Overview

**OGG File Renamer (Paradox Interactive Music MOD Support Tool)** is a GUI app for preparing OGG files for music mods in games such as HoI4, EU4, and CK3. It converts Japanese filenames to romanized names for use in game and creates localization files to display the original Japanese titles.

<!-- i18n:features -->
## Features

- Load OGG files by dragging and dropping files or folders.
- Romanize kanji, hiragana, and katakana filenames.
- Add prefixes, apply regular expression replacements, and resolve duplicate names with numbered suffixes.
- Check filename length, with a default warning threshold of 63 characters.
- Preview the original audio and edit converted names directly.
- Generate `_l_japanese.yml` files linking Japanese titles to converted names.
- Save renamed copies to the output folder while preserving the originals.
- Restore settings such as output paths and filename length limits on the next launch.

<!-- i18n:downloads -->
## Launch

On Windows, launch `OGG-File-Renamer.exe` to use the app. A separate Python installation is not required.

<!-- i18n:usage -->
## Getting started

1. Use the buttons or drag and drop OGG files or folders into the app.
2. Review converted names and resolve red warnings by editing names or applying bulk replacements. Use the playback button to check the original audio.
3. Choose an output folder and click the rename button (「リネーム実行」) to export renamed OGG copies and Japanese localization YAML.
4. Add the exported files to your mod and prepare music definitions. You can use [Music Mod Creation Tool](https://runite-drill.github.io/music-mod-creation-tool/) for this step.

<!-- i18n:settings -->
## Settings and source code

Settings are saved in `settings/` beside the executable or script. `config.json` holds app preferences, and `forbidden_chars.json` lists characters to replace.

Python 3.10 or later is recommended for running from source, along with PySide6, pykakasi, and PyYAML. See the [project README](https://github.com/Ikumyon/Paradox-Interactive_music_MOD_support/blob/main/README.md) for details.
