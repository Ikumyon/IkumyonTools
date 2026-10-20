<!-- i18n:overview -->
## Overview

**KCO Senka Reader** is a companion browser extension that estimates regular ranking points (senka) from increases in admiral XP and sends the results to the information panel in Kancolle Stream Overlay.
It independently implements a conversion based on KC3's formula. Installing KC3 itself is not required.

<!-- i18n:features -->
## Features

Converts the change in admiral XP to regular senka using: XP gained × 7 / 10000.
It uses cutoff boundaries aligned with KC3, including 02:00 and 14:00 Japan Standard Time, and sends the calculated values to the senka card in Kancolle Stream Overlay.

The accumulated state is saved in the extension's local storage.

<!-- i18n:installation -->
## Setup

1. Load this as a separate extension in Damecon or Chrome / Edge.
2. Load Kancolle Stream Overlay as well, then reload the game page.
3. Keep Developer Tools open on the game tab and visit the home port.
4. Add a senka card to the overlay's information panel.
5. In the overlay's senka card settings, confirm that the reader has loaded successfully.

<!-- i18n:notes -->
## Notes

- Sends no additional requests to the game server. It observes responses already received by the browser through the DevTools API.
- The first observed admiral XP value is the baseline; points earned before setup cannot be recovered.
- Extra Operation bonuses, quest bonus senka and carried-over senka are not included.
- Observation stops when Developer Tools is closed.

<!-- i18n:verification -->
## Verification

To run checks using synthetic data, execute this command from the parent directory of the repository:

```bash
node --test KCO_senka_reader/core.test.js KCO_senka_reader/integration.test.js
```
