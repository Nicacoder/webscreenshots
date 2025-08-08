# Configuration Reference for Webscreenshots

This document provides a comprehensive reference for all configuration options available in Webscreenshots, mapping them across:

- **CLI flags** (command line arguments)
- **Config file keys** (in JSON/JS/TS config files)
- **Environment variables** (for `.env` files)

---

## Table of Contents

1. [Top-Level Options](#top-level-options)
2. [Browser Options](#browser-options)
3. [Capture Options](#capture-options)
4. [Viewports](#viewports)
5. [Crawl Options](#crawl-options)
6. [Retry Options](#retry-options)
7. [Authentication Options](#authentication-options)

---

## Top-Level Options

| CLI Flag          | Config File Key              | Env Variable                                  | Description                                                                                 | Example                                             |
| ----------------- | ---------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `--url`           | `url`                        | `WEBSCREENSHOTS__URL`                         | The website URL to capture                                                                  | `https://example.com`                               |
| `--output`        | `outputDir`                  | `WEBSCREENSHOTS__OUTPUTDIR`                   | Folder to save screenshots                                                                  | `./screenshots`                                     |
| `--outputPattern` | `outputPattern`              | `WEBSCREENSHOTS__OUTPUTPATTERN`               | Pattern for generated file names (placeholders: `{host}`, `{route}`, `{viewport}`, `{ext}`) | `{host}/{viewport}/{host}-{viewport}-{route}.{ext}` |
| `--routes`        | `routes`                     | `WEBSCREENSHOTS__ROUTES`                      | Comma-separated list of specific routes to capture                                          | `/home,/about`                                      |
| `--excludeRoutes` | `crawlOptions.excludeRoutes` | `WEBSCREENSHOTS__CRAWLOPTIONS__EXCLUDEROUTES` | Comma-separated routes to exclude during crawling                                           | `/private,/login`                                   |
| `--crawl`         | `crawl`                      | `WEBSCREENSHOTS__CRAWL`                       | Enable crawling to auto-discover internal pages                                             | `true`                                              |

---

## Browser Options

| CLI Flag        | Config File Key           | Env Variable                               | Description                                 | Example                      |
| --------------- | ------------------------- | ------------------------------------------ | ------------------------------------------- | ---------------------------- |
| `--headless`    | `browserOptions.headless` | `WEBSCREENSHOTS__BROWSEROPTIONS__HEADLESS` | Run browser in headless mode                | `true`                       |
| `--browserArgs` | `browserOptions.args`     | `WEBSCREENSHOTS__BROWSEROPTIONS__ARGS`     | Extra arguments to pass to Puppeteer.launch | `--no-sandbox,--disable-gpu` |

---

## Capture Options

| CLI Flag      | Config File Key            | Env Variable                                | Description                               | Example |
| ------------- | -------------------------- | ------------------------------------------- | ----------------------------------------- | ------- |
| `--fullPage`  | `captureOptions.fullPage`  | `WEBSCREENSHOTS__CAPTUREOPTIONS__FULLPAGE`  | Capture the entire scrollable page        | `true`  |
| `--imageType` | `captureOptions.imageType` | `WEBSCREENSHOTS__CAPTUREOPTIONS__IMAGETYPE` | Image format (png, jpeg, webp)            | `jpeg`  |
| `--quality`   | `captureOptions.quality`   | `WEBSCREENSHOTS__CAPTUREOPTIONS__QUALITY`   | Image quality (0-100, only for jpeg/webp) | `80`    |

---

## Viewports

| CLI Flag | Config File Key | Env Variable                | Description                    | Example                                                                                                            |
| -------- | --------------- | --------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| (none)   | `viewports`     | `WEBSCREENSHOTS__VIEWPORTS` | JSON array of viewport objects | `[{"name":"mobile","width":375,"height":667,"deviceScaleFactor":2},{"name":"desktop","width":1920,"height":1080}]` |

---

## Crawl Options

| CLI Flag               | Config File Key                   | Env Variable                                       | Description                       | Example         |
| ---------------------- | --------------------------------- | -------------------------------------------------- | --------------------------------- | --------------- |
| `--crawlLimit`         | `crawlOptions.crawlLimit`         | `WEBSCREENSHOTS__CRAWLOPTIONS__CRAWLLIMIT`         | Max number of pages to crawl      | `30`            |
| `--excludeRoutes`      | `crawlOptions.excludeRoutes`      | `WEBSCREENSHOTS__CRAWLOPTIONS__EXCLUDEROUTES`      | Comma-separated routes to exclude | `/admin,/login` |
| `--dynamicRoutesLimit` | `crawlOptions.dynamicRoutesLimit` | `WEBSCREENSHOTS__CRAWLOPTIONS__DYNAMICROUTESLIMIT` | Max dynamic routes per group      | `5`             |

---

## Retry Options

| CLI Flag        | Config File Key            | Env Variable                                | Description                                  | Example |
| --------------- | -------------------------- | ------------------------------------------- | -------------------------------------------- | ------- |
| `--maxAttempts` | `retryOptions.maxAttempts` | `WEBSCREENSHOTS__RETRYOPTIONS__MAXATTEMPTS` | Maximum retry attempts before giving up      | `3`     |
| `--delayMs`     | `retryOptions.delayMs`     | `WEBSCREENSHOTS__RETRYOPTIONS__DELAYMS`     | Delay in milliseconds between retry attempts | `1000`  |

---

## Authentication Options

| CLI Flag             | Config File Key      | Env Variable                          | Description                                                | Example |
| -------------------- | -------------------- | ------------------------------------- | ---------------------------------------------------------- | ------- |
| (no direct CLI flag) | `authOptions.method` | `WEBSCREENSHOTS__AUTHOPTIONS__METHOD` | Authentication method (`basic`, `cookie`, `form`, `token`) | `basic` |

### Basic Auth

| CLI Flag             | Config File Key              | Env Variable                                   | Description         | Example    |
| -------------------- | ---------------------------- | ---------------------------------------------- | ------------------- | ---------- |
| (no direct CLI flag) | `authOptions.basic.username` | `WEBSCREENSHOTS__AUTHOPTIONS__BASIC__USERNAME` | Basic auth username | `admin`    |
| (no direct CLI flag) | `authOptions.basic.password` | `WEBSCREENSHOTS__AUTHOPTIONS__BASIC__PASSWORD` | Basic auth password | `P4$$w0rd` |

### Cookie Auth

| CLI Flag             | Config File Key           | Env Variable                               | Description                    | Example          |
| -------------------- | ------------------------- | ------------------------------------------ | ------------------------------ | ---------------- |
| (no direct CLI flag) | `authOptions.cookiesPath` | `WEBSCREENSHOTS__AUTHOPTIONS__COOKIESPATH` | Path to JSON file with cookies | `./cookies.json` |

### Form-based Auth

| CLI Flag             | Config File Key                    | Env Variable                                         | Description                               | Example                                                                  |
| -------------------- | ---------------------------------- | ---------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------ |
| (no direct CLI flag) | `authOptions.form.loginUrl`        | `WEBSCREENSHOTS__AUTHOPTIONS__FORM__LOGINURL`        | URL of login page                         | `https://example.com/login`                                              |
| (no direct CLI flag) | `authOptions.form.inputs`          | `WEBSCREENSHOTS__AUTHOPTIONS__FORM__INPUTS`          | JSON object of input selectors and values | `{"input[name=email]":"user@example.com","input[name=password]":"P4$$"}` |
| (no direct CLI flag) | `authOptions.form.submit`          | `WEBSCREENSHOTS__AUTHOPTIONS__FORM__SUBMIT`          | Submit button selector                    | `button[type=submit]`                                                    |
| (no direct CLI flag) | `authOptions.form.errorSelector`   | `WEBSCREENSHOTS__AUTHOPTIONS__FORM__ERRORSELECTOR`   | CSS selector for login error              | `.error`                                                                 |
| (no direct CLI flag) | `authOptions.form.successSelector` | `WEBSCREENSHOTS__AUTHOPTIONS__FORM__SUCCESSSELECTOR` | CSS selector for successful login         | `.dashboard`                                                             |
| (no direct CLI flag) | `authOptions.form.timeoutMs`       | `WEBSCREENSHOTS__AUTHOPTIONS__FORM__TIMEOUT_MS`      | Timeout in ms for login form submission   | `5000`                                                                   |

### Token-based Auth

| CLI Flag             | Config File Key            | Env Variable                                 | Description                  | Example         |
| -------------------- | -------------------------- | -------------------------------------------- | ---------------------------- | --------------- |
| (no direct CLI flag) | `authOptions.token.header` | `WEBSCREENSHOTS__AUTHOPTIONS__TOKEN__HEADER` | Header name to set the token | `Authorization` |
| (no direct CLI flag) | `authOptions.token.value`  | `WEBSCREENSHOTS__AUTHOPTIONS__TOKEN__VALUE`  | Token value                  | `Bearer abc123` |

---

# Examples

### Example CLI usage:

```bash
npx @nicacoder/webscreenshots --url https://example.com --output ./screenshots --fullPage --imageType jpeg --quality 80 --headless
```

### Example config JSON snippet:

```json
{
  "url": "https://example.com",
  "outputDir": "./screenshots",
  "captureOptions": {
    "fullPage": true,
    "imageType": "jpeg",
    "quality": 80
  },
  "browserOptions": {
    "headless": true
  }
}
```

### Example `.env` snippet:

```env
WEBSCREENSHOTS__URL=https://example.com
WEBSCREENSHOTS__OUTPUTDIR=./screenshots
WEBSCREENSHOTS__CAPTUREOPTIONS__FULLPAGE=true
WEBSCREENSHOTS__CAPTUREOPTIONS__IMAGETYPE=jpeg
WEBSCREENSHOTS__CAPTUREOPTIONS__QUALITY=80
WEBSCREENSHOTS__BROWSEROPTIONS__HEADLESS=true
```
