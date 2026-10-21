<!-- i18n:overview -->
## Overview

**Infill** is a desktop app that combines CSV columns with a text template to generate multiple text files in bulk. Use it for email drafts, name badge data, boilerplate code, and other tasks that insert different data into a shared format.

<!-- i18n:features -->
## Features

- Drag and drop your CSV, template, and output folder.
- Customize placeholder delimiters, using formats such as `{name}` or `[[id]]`.
- Preview substituted text before exporting, with missing fields highlighted in red.
- Export each CSV row as a separate file or combine all rows into a single file. For separate files, select a column to use for filenames.
- Choose UTF-8 or Shift_JIS encoding and CRLF or LF line endings.
- Restore your previous paths and settings when you launch the app again.

<!-- i18n:downloads -->
## Download and requirements

`Infill.exe` is available for Windows 10 / 11 on [GitHub Releases](https://github.com/Ikumyon/Infill/releases/latest). Download and launch the executable. The prebuilt app does not require a Python installation.

<!-- i18n:usage -->
## Getting started

1. Prepare a CSV with column names in the first row and a text template containing placeholders.
2. Launch the app and drag the CSV and template onto its window.
3. Select an output folder. Adjust separate or combined output, the filename column, encoding, and line endings as needed.
4. Review the preview for missing fields, then click the output button (「出力実行」).

<!-- i18n:project -->
## Source code and license

See the [project README](https://github.com/Ikumyon/Infill/blob/main/README.md) for source code and development instructions. Running from source requires Python 3.14 or later and PySide6.

The project is distributed under the [MIT License](https://github.com/Ikumyon/Infill/blob/main/LICENSE).
