<!-- i18n:overview -->
## Overview

**SteamCMD Workshop Downloader** provides a GUI for SteamCMD. Enter a game or Workshop item URL to extract its ID and retrieve content without memorizing commands.

<!-- i18n:features -->
## Features

- Accept game and Workshop URLs or IDs.
- Select the SteamCMD executable and output folder in the GUI.
- Choose anonymous login or login with a username and password.
- Start or stop processing, inspect logs, and open the output folder.
- Send authentication codes and other input to SteamCMD.
- Switch between Japanese and English, with settings stored beside the executable.

<!-- i18n:requirements -->
## Requirements and launch

The app is provided for Windows and requires a separate SteamCMD installation. Extract the entire ZIP folder and launch `steamCMDGUI.exe`. Keep the `localization` folder beside the executable.

<!-- i18n:usage -->
## Getting started

1. Select the path to `steamcmd.exe`.
2. Enter the game's AppID or URL and the Workshop item's ID or URL.
3. Choose an output folder and login method, then start the download.
4. If prompted for an authentication code or other input, send it through the SteamCMD input field at the bottom.
5. Check the log and open the output folder to inspect the files.

<!-- i18n:project -->
## Source code and license

Running from source uses Python and PySide6. Launch with `python steamCMDGUI.py`. See the [project README](https://github.com/Ikumyon/steamCMDGUI/blob/main/README.md) for details. The project uses the MIT License.
