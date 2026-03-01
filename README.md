# Superbits RSS Viewer

A Node.js web application that fetches and displays torrent listings from [Superbits.org](https://superbits.org) — a private BitTorrent tracker.

## Features

- **RSS feed viewer** – fetches the Superbits RSS feed and presents torrents in a clean, dark-themed table (title, date, category, link).
- **P2P scraper** – uses [Puppeteer](https://github.com/puppeteer/puppeteer) with the [Stealth Plugin](https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth) to bypass Cloudflare protection and scrape the live P2P page.
- **Cookie authentication** – reads session cookies from `cookies.json` so that authenticated content is accessible without logging in interactively.

## Tech stack

| Layer | Technology |
|-------|------------|
| Runtime | [Node.js](https://nodejs.org) (ES modules) |
| Web server | [Express](https://expressjs.com) |
| Headless browser | [Puppeteer Extra](https://github.com/berstend/puppeteer-extra) + Stealth Plugin |
| Frontend | Vanilla HTML / CSS / JavaScript |

## Getting started

### Prerequisites

- Node.js 18 or later
- npm

### Install dependencies

```bash
npm install
```

### Add cookies (optional)

Export your Superbits session cookies to `cookies.json` in the project root. The file should be an array of cookie objects with at least `name` and `value` fields. Without cookies the server will still start, but authenticated pages will not be accessible.

### Start the server

```bash
npm start
```

The server listens on port `8000` by default (override with the `PORT` environment variable).

Open `http://localhost:8000` in your browser to view the RSS torrent feed.

### Endpoints

| Path | Description |
|------|-------------|
| `/` | RSS feed viewer frontend |
| `/rss` | Proxies the Superbits RSS feed (JSON/XML) |
| `/p2p` | Returns the scraped HTML of the Superbits P2P page |
