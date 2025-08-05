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
- Pass extra browser args to Puppeteer

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

## 📁 Output Structure

Screenshots are saved inside folders by **viewport name**, and filenames follow a descriptive pattern:

### Folder Structure

```
screenshots/
├── mobile/
│   ├── example-com-products-summer-sale-mobile.jpeg
│   └── example-com-contact-mobile.jpeg
└── desktop/
    ├── example-com-products-summer-sale-desktop.jpeg
    └── example-com-contact-desktop.jpeg
```

### Filename Pattern

```
<domain>-<route-name>-<viewport-name>.<ext>
```

- **Domain**: Sanitized version of the site (e.g. `example.com` → `example-com`)
- **Route**: Path segments joined by hyphens (e.g. `/products/summer-sale`)
- **Viewport**: From the `viewport.name` in config
- **Extension**: Based on `imageType` (`png`, `jpeg`, or `webp`)

---

## 🛠 Tooling

This project is built using:

- **[Node.js](https://nodejs.org/)** – Runtime environment
- **[TypeScript](https://www.typescriptlang.org/)** – Static type checking
- **[Puppeteer](https://pptr.dev/)** – Headless browser automation for capturing screenshots
- **[Ora](https://www.npmjs.com/package/ora)** – Elegant terminal spinners for status feedback
- **[Yargs](https://www.npmjs.com/package/yargs)** – CLI argument parsing

---

## 📄 License

This project is licensed under the Apache License 2.0. See the [LICENSE](./LICENSE) file for details.
