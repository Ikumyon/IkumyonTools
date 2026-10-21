<!-- i18n:overview -->
## Overview

**NRClipBuilder** is a desktop app for previewing, filtering, and exporting GIS data such as railway lines. It creates `.nrclip` files for NIMBY Rails and Overpass-style JSON for Turnout.

<!-- i18n:features -->
## Features

- Import national land data ZIPs such as N05, Shapefiles, and GeoJSON.
- Retrieve railway data for a selected map area through the Overpass API.
- Manage multiple layers, including drawing order, visibility, and removal.
- Filter with keywords, excluded terms, attributes, OR/AND conditions, and categories such as rail, subway, tram, and monorail.
- Preview data over GSI maps, aerial imagery, or OpenStreetMap.
- Clip to a bounding box and save frequently used areas in history.
- Export GeoJSON, JSON for Turnout, and NIMBY Rails `.nrclip` files.
- Switch the interface language. The current source contains translation files for 85 languages and regions.

<!-- i18n:requirements -->
## Requirements and launch

On Windows, extract the entire ZIP folder and launch `nrclip_builder.exe`. Keep the `localisation` folder beside the executable.

To run from source, prepare a Python environment, run `install_requirements.bat`, and launch with `run.bat` or `python nrclip_builder.py`. You can also pass a data file path as a launch argument.

<!-- i18n:usage -->
## Getting started

1. Open a GIS file, or select an area on the map and retrieve OSM railway data.
2. Adjust layer order and visibility, then inspect the map and attribute table.
3. Apply keyword, attribute, and railway category filters.
4. Select a bounding box to clip the output if needed.
5. Export as GeoJSON, JSON for Turnout, or `.nrclip`.

<!-- i18n:project -->
## Related project and license

The app reimplements and extends data structures, checksums, and serialization from [Turnout](https://github.com/SuperManifolds/Turnout) in Python. It uses the MIT License. See the [project README](https://github.com/Ikumyon/NRClipBuilder/blob/main/README.md) for details.
