<!-- i18n:overview -->
## Overview

**NRClipBuilder** is a desktop app for previewing, filtering, and exporting GIS data such as railway lines. It creates `.nrclip` files for NIMBY Rails, PMTiles background railway maps, and Overpass-style JSON for Turnout.

<!-- i18n:features -->
## Features

- Import national land data ZIPs such as N05, Shapefiles, and GeoJSON.
- Retrieve railway data for a selected map area through the Overpass API.
- Manage multiple layers, including drawing order, visibility, and removal.
- Filter with keywords, excluded terms, attributes, OR/AND conditions, and categories such as rail, subway, tram, and monorail.
- Preview data over GSI maps, aerial imagery, or OpenStreetMap.
- Clip to a bounding box and save frequently used areas in history.
- Export GeoJSON, JSON for Turnout, NIMBY Rails `.nrclip` files, and PMTiles background maps.
- Switch the interface language. The current source contains translation files for 85 languages and regions.

<!-- i18n:requirements -->
## Requirements and launch

Supports Windows x64 and Linux x64 on Ubuntu 24.04 or later. The packaged app does not require a Python installation.

- Windows: Extract the ZIP and launch `NRClipBuilder.exe` in the extracted folder.
- Linux: Extract the tar.gz and run `./NRClipBuilder` from the extracted folder.

Keep the entire extracted folder intact. See the [project README](https://github.com/Ikumyon/NRClipBuilder/blob/main/README.md) for instructions on running from source. You can also pass a data file path as a launch argument.

<!-- i18n:usage -->
## Getting started

1. Open a GIS file, or select an area on the map and retrieve OSM railway data.
2. Adjust layer order and visibility, then inspect the map and attribute table.
3. Apply keyword, attribute, and railway category filters.
4. Select a bounding box to clip the output if needed.
5. Open **File → Export…** and choose the NRC1 (`.nrclip`), PMTiles, GeoJSON, or Turnout JSON tab to export.

<!-- i18n:pmtiles -->
## PMTiles in NIMBY Rails

PMTiles displays a background railway map. Use NRC1 (`.nrclip`) to export tracks for construction and operation.

In NIMBY Rails 1.19 or later, open **Map options → Sources → New source**, add the exported local `.pmtiles` file, and use a style that displays OpenMapTiles railways. Colors and line styles follow the game style; the app does not generate a dedicated style mod.

PMTiles is generated without external tools. Export zoom defaults to 0–14 and accepts values from 0–22.

<!-- i18n:project -->
## Related project and license

The app reimplements and extends data structures, checksums, and serialization from [Turnout](https://github.com/SuperManifolds/Turnout) in Python. It uses the MIT License. See the [project README](https://github.com/Ikumyon/NRClipBuilder/blob/main/README.md) for details.
