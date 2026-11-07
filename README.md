# MyTab

MyTab is a personal dashboard that replaces the browser's new-tab page. It is a dependency-free Manifest V3 extension for Chrome and other Chromium-based browsers.

## Features

- Live clock, date, and greeting
- Search with Google, Bing, DuckDuckGo, or Yahoo
- Editable, reorderable website shortcuts
- Quick notes and a to-do list
- Optional local weather and a calendar with events
- Wallpaper upload, appearance controls, themes, and dashboard layout customisation

## Install from source

1. Download or clone this repository.
2. Open `chrome://extensions` in Chrome (or `edge://extensions` in Edge).
3. Turn on **Developer mode**.
4. Select **Load unpacked** and choose the `MyTab` project folder containing `manifest.json`.
5. Open a new tab to use MyTab.

After making changes, select **Reload** on the extension's card to load the updated files.

## Privacy and permissions

- MyTab uses the Chrome `storage` permission to keep your preferences, shortcuts, notes, tasks, and calendar events on your device. Uploaded wallpapers are stored in the extension's IndexedDB database.
- Weather is optional. When weather is requested, MyTab asks the browser for your location and sends the coordinates to the Open-Meteo API to retrieve a forecast. Coordinates are kept in memory by MyTab and are not saved as dashboard data.
- Search terms are sent to the search provider you select.
- Website shortcuts use Google's favicon service by default. A custom icon URL, if provided, is requested from that URL instead.
- MyTab does not include analytics, advertising, accounts, or a backend service.

## Development checks

No package installation or build step is required. With Node.js installed, run:

```sh
node scripts/validate-project.mjs
```

This checks the extension manifest, local resources referenced by `index.html`, and JavaScript syntax. GitHub Actions runs the same check for pushes and pull requests.

## Project structure

```text
manifest.json       Extension metadata and permissions
index.html          New-tab dashboard markup
css/                Dashboard and widget styles
js/                 Dashboard features and browser storage helpers
scripts/            Local project validation
```
