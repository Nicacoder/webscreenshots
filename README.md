# Webscreenshots

A simple CLI tool to capture screenshots of websites at different viewports.  
Supports crawling, full-page capture, and custom configuration.

---

## ✨ Features

- Capture full-page or viewport-specific screenshots
- Supports multiple viewports
- Crawl your site to auto-discover internal pages
- Custom image format
- Headless or non-headless mode
- Authentication Support (Basic, Cookie, Form, Token)

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

---

## ⚙️ Configuration

You can configure Webscreenshots in several ways:

1. **CLI Arguments** – Pass options directly when running the CLI, e.g. `--url https://example.com`.
2. **Configuration File** – Provide a `.json` config file with all your settings.
3. **Environment Variables** – Set environment variables directly or via a `.env` file.

The precedence order is:
**CLI Arguments > Environment Variables > Configuration File**

That means CLI arguments override environment variables, which in turn override configuration file settings.

### Using a Configuration File

Create a `webscreenshots.json` config file with your settings, for example:

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

Run the CLI with the config file:

```bash
npx @nicacoder/webscreenshots --config ./webscreenshots.json
```

### Using Environment Variables

You can configure Webscreenshots by setting environment variables. For example:

```bash
WEBSCREENSHOTS__URL=https://example.com WEBSCREENSHOTS__OUTPUTDIR=./screenshots npx @nicacoder/webscreenshots
```

Or by defining an `.env` file:

```env
WEBSCREENSHOTS__URL=https://example.com
WEBSCREENSHOTS__OUTPUTDIR=custom-screenshots
WEBSCREENSHOTS__CAPTUREOPTIONS__FULLPAGE=true
WEBSCREENSHOTS__CAPTUREOPTIONS__IMAGETYPE=jpeg
WEBSCREENSHOTS__CAPTUREOPTIONS__QUALITY=80
WEBSCREENSHOTS__BROWSEROPTIONS__HEADLESS=true
```

The CLI will automatically use the `.env` file if present.
You can use the provided [`.env.example`](./.env.example) file as a starting point by copying it to `.env` and modifying the values as needed.

---

For full details on all available configuration options, their CLI flags, config file keys, and environment variable equivalents, see the [CONFIGURATION.md](./CONFIGURATION.md) file.

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

## 🔐 Authentication

Webscreenshots supports various authentication methods to handle sites requiring login or tokens, including:

- **Basic Authentication**
- **Cookie-based Authentication**
- **Form-based Authentication**
- **Token-based Authentication**

You can configure authentication via environment variables. See the [AUTHENTICATION.md](./AUTHENTICATION.md) file for full details and examples.

---

## 🛠 Tooling

This project is built using:

- **[Node.js](https://nodejs.org/)** – Runtime environment
- **[TypeScript](https://www.typescriptlang.org/)** – Static type checking
- **[Puppeteer](https://pptr.dev/)** – Headless browser automation for capturing screenshots
- **[Yargs](https://www.npmjs.com/package/yargs)** – CLI argument parsing
- **[Ajv](https://ajv.js.org/)** – JSON Schema validator for configuration files

---

## 📄 License

This project is licensed under the Apache License 2.0. See the [LICENSE](./LICENSE) file for details.
