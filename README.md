# Webscreenshots

A simple CLI tool to capture screenshots of websites at different viewports.  
Supports crawling, full-page capture, and custom configuration.

---

## ✨ Features

- Capture full-page or viewport-specific screenshots
- Supports multiple viewports
- Crawl your site to auto-discover internal pages
- CLI and config-based usage
- Custom image format and quality
- JPEG/WebP quality control
- Headless or non-headless mode

---

## 📦 Installation

Use via `npx` (no global install required):

```bash
npx @nicacoder/webscreenshots --url https://example.com
```

Or add to your project:

```bash
npm install --save-dev @nicacoder/webscreenshots
```

---

## 🚀 Usage

### Basic CLI Usage

```bash
npx @nicacoder/webscreenshots --url https://example.com
```

#### ⚙️ CLI Options

| Flag                   | Type      | Description                                            |
| ---------------------- | --------- | ------------------------------------------------------ |
| `--url`                | string    | Website URL to capture (required unless set in config) |
| `--output`             | string    | Output directory for screenshots                       |
| `--outputPattern`      | string    | Pattern for generated file paths and names             |
| `--config`             | string    | Path to a config file (`.json`, `.js`, or `.ts`)       |
| `--routes`             | string\[] | Specific routes to capture (`/`, `/about`, etc.)       |
| `--excludeRoutes`      | string\[] | Routes to exclude during crawling                      |
| `--crawl`              | boolean   | Enable crawling to auto-discover internal links        |
| `--crawlLimit`         | number    | Max number of pages to crawl                           |
| `--dynamicRoutesLimit` | number    | Max number of dynamic routes per group during crawl    |
| `--fullPage`           | boolean   | Capture the entire scrollable page                     |
| `--imageType`          | string    | Screenshot format: `png`, `jpeg`, or `webp`            |
| `--quality`            | number    | Image quality (0–100, only for `jpeg` and `webp`)      |
| `--headless`           | boolean   | Run browser in headless mode (default: true)           |
| `--browserArgs`        | string\[] | Extra arguments to pass to `puppeteer.launch()`        |
| `--maxAttempts`        | number    | Max number of attempts before giving up (default: 1)   |
| `--delayMs`            | number    | Delay in ms between retry attempts (default: 0)        |

---

### With Configuration File

Create a `webscreenshots.json` and run:

```bash
npx @nicacoder/webscreenshots
```

Or pass the config manually:

```bash
npx @nicacoder/webscreenshots --config ./path/to/config.json
```

#### 📝 Configuration File (`webscreenshots.json`)

```json
{
  "url": "https://example.com",
  "outputDir": "./screenshots",
  "outputPattern": "{host}/{viewport}/{host}-{viewport}-{route}-{timestamp}.{ext}",
  "routes": ["/", "/products", "/contact"],
  "browserOptions": {
    "headless": true,
    "args": ["--no-sandbox"]
  },
  "captureOptions": {
    "fullPage": true,
    "imageType": "jpeg",
    "quality": 80
  },
  "viewports": [
    {
      "name": "mobile",
      "width": 375,
      "height": 812
    },
    {
      "name": "desktop",
      "width": 1440,
      "height": 900
    }
  ],
  "crawl": true,
  "crawlOptions": {
    "crawlLimit": 30,
    "excludeRoutes": ["/admin"],
    "dynamicRoutesLimit": 5
  },
  "retryOptions": {
    "maxAttempts": 3,
    "delayMs": 1000
  }
}
```

---

## 🌱 Using Environment Variables

You can configure key options using environment variables by creating a `.env` file in your project root.

### Quick Start with `.env.example`

1. Copy the provided `.env.example` file to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Open `.env` and uncomment the variables you want to set, adjusting the values as needed.

3. The `.env` file is ignored by git by default to keep your secrets safe.

### Environment Variables Format

The `.env` file supports all configuration options, such as:

- `WEBSCREENSHOTS__URL` — The website URL to capture
- `WEBSCREENSHOTS__OUTPUTDIR` — Output folder for screenshots
- `WEBSCREENSHOTS__CAPTUREOPTIONS__FULLPAGE` — Whether to capture full page
- `WEBSCREENSHOTS__CRAWL` — Enable crawling for internal routes
- `WEBSCREENSHOTS__AUTHOPTIONS__METHOD` — Authentication method (basic, cookie, form, token)
- ... and many more (see [`.env.example`](./.env.example) for full list and examples)

You can combine environment variables with CLI arguments or configuration files for flexible setups.

---

## 📁 Output Structure

Screenshots are saved inside folders by **site** and **viewport name**, and filenames follow a customizable pattern.

### Folder Structure

```
screenshots/
├── example-com/
│   ├── desktop/
│   │   ├── example-com-desktop-home.png
│   │   └── example-com-desktop-docs-about.png
│   └── mobile/
│       ├── example-com-mobile-contact.png
│       └── example-com-mobile-products.png
└── another-site-com/
    └── desktop/
        └── another-site-com-desktop-home.png
```

### Filename Pattern

By default, files are named using this pattern:

```
{host}/{viewport}/{host}-{viewport}-{route}.{ext}
```

- `{host}` — Sanitized domain name (dots replaced with dashes, e.g. `example.com` → `example-com`)
- `{viewport}` — Viewport name (lowercased, spaces replaced with dashes)
- `{route}` — URL path segments joined by dashes (`/docs/about` → `docs-about`)
- `{ext}` — File extension matching the image format (`png`, `jpeg`, or `webp`)

You can customize the pattern in your config or CLI options, including adding timestamps:

```
{host}/{viewport}/{host}-{viewport}-{route}-{timestamp}.{ext}
```

Where `{timestamp}` is an ISO timestamp safe for filenames (colons and dots replaced with dashes).

---

## 🛠 Tooling

This project is built using:

- **[Node.js](https://nodejs.org/)** – Runtime environment
- **[TypeScript](https://www.typescriptlang.org/)** – Static type checking
- **[Puppeteer](https://pptr.dev/)** – Headless browser automation for capturing screenshots
- **[Yargs](https://www.npmjs.com/package/yargs)** – CLI argument parsing

---

## 📄 License

This project is licensed under the Apache License 2.0. See the [LICENSE](./LICENSE) file for details.
