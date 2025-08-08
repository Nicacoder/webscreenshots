# Environment Variables Reference

Below is the full list of environment variables supported by Webscreenshots.

---

## Top-level options

| Variable                        | Description                      | Example Value                     |
| ------------------------------- | -------------------------------- | --------------------------------- |
| `WEBSCREENSHOTS__URL`           | Website URL to capture           | `https://example.com`             |
| `WEBSCREENSHOTS__OUTPUTDIR`     | Output directory                 | `custom-screenshots`              |
| `WEBSCREENSHOTS__OUTPUTPATTERN` | File naming pattern              | `{host}/{route}/{viewport}.{ext}` |
| `WEBSCREENSHOTS__ROUTES`        | Comma-separated list of routes   | `/home,/about`                    |
| `WEBSCREENSHOTS__CRAWL`         | Enable crawling (`true`/`false`) | `true`                            |

---

## Browser options

| Variable                                   | Description            | Example Value                |
| ------------------------------------------ | ---------------------- | ---------------------------- |
| `WEBSCREENSHOTS__BROWSEROPTIONS__HEADLESS` | Headless browser mode  | `false`                      |
| `WEBSCREENSHOTS__BROWSEROPTIONS__ARGS`     | Extra launch arguments | `--no-sandbox,--disable-gpu` |

---

## Capture options

| Variable                                    | Description                  | Example Value |
| ------------------------------------------- | ---------------------------- | ------------- |
| `WEBSCREENSHOTS__CAPTUREOPTIONS__FULLPAGE`  | Capture full page            | `true`        |
| `WEBSCREENSHOTS__CAPTUREOPTIONS__IMAGETYPE` | Image format (png/jpeg/webp) | `jpeg`        |
| `WEBSCREENSHOTS__CAPTUREOPTIONS__QUALITY`   | JPEG/WebP quality (0–100)    | `80`          |

---

## Crawl options

| Variable                                           | Description                     | Example Value     |
| -------------------------------------------------- | ------------------------------- | ----------------- |
| `WEBSCREENSHOTS__CRAWLOPTIONS__CRAWLLIMIT`         | Max pages to crawl              | `10`              |
| `WEBSCREENSHOTS__CRAWLOPTIONS__EXCLUDEROUTES`      | Comma-separated excluded routes | `/private,/login` |
| `WEBSCREENSHOTS__CRAWLOPTIONS__DYNAMICROUTESLIMIT` | Max dynamic routes per group    | `5`               |

---

## Retry options

| Variable                                    | Description                | Example Value |
| ------------------------------------------- | -------------------------- | ------------- |
| `WEBSCREENSHOTS__RETRYOPTIONS__MAXATTEMPTS` | Max retry attempts         | `4`           |
| `WEBSCREENSHOTS__RETRYOPTIONS__DELAYMS`     | Delay between retries (ms) | `1000`        |

---

## Viewports

| Variable                    | Description             | Example Value                                                                                                      |
| --------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `WEBSCREENSHOTS__VIEWPORTS` | JSON array of viewports | `[{"name":"mobile","width":375,"height":667,"deviceScaleFactor":2},{"name":"desktop","width":1920,"height":1080}]` |

---

## Authentication options

### General

| Variable                              | Description                                      | Example Value |
| ------------------------------------- | ------------------------------------------------ | ------------- |
| `WEBSCREENSHOTS__AUTHOPTIONS__METHOD` | Auth method (`basic`, `cookie`, `form`, `token`) | `basic`       |

---

### Basic Auth

| Variable                                       | Description        | Example Value |
| ---------------------------------------------- | ------------------ | ------------- |
| `WEBSCREENSHOTS__AUTHOPTIONS__BASIC__USERNAME` | HTTP Auth username | `admin`       |
| `WEBSCREENSHOTS__AUTHOPTIONS__BASIC__PASSWORD` | HTTP Auth password | `secret`      |

---

### Cookie Auth

| Variable                                   | Description                          | Example Value    |
| ------------------------------------------ | ------------------------------------ | ---------------- |
| `WEBSCREENSHOTS__AUTHOPTIONS__COOKIESPATH` | Path to JSON file containing cookies | `./cookies.json` |

> **Note:** The cookie file must contain a **JSON array** of cookie objects, each with properties like `name`, `value`, `domain`, `path`, `expires`, `httpOnly`, `secure`, `sameSite`, and `sourceScheme`.

---

### Form-based Auth

| Variable                                             | Description                               | Example Value                                                            |
| ---------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------ |
| `WEBSCREENSHOTS__AUTHOPTIONS__FORM__LOGINURL`        | Login page URL                            | `https://example.com/login`                                              |
| `WEBSCREENSHOTS__AUTHOPTIONS__FORM__INPUTS`          | JSON object of input selectors and values | `{"input[name=email]":"user@example.com","input[name=password]":"P4$$"}` |
| `WEBSCREENSHOTS__AUTHOPTIONS__FORM__SUBMIT`          | Submit button selector                    | `button[type=submit]`                                                    |
| `WEBSCREENSHOTS__AUTHOPTIONS__FORM__ERRORSELECTOR`   | Error selector                            | `.error`                                                                 |
| `WEBSCREENSHOTS__AUTHOPTIONS__FORM__SUCCESSSELECTOR` | Success selector                          | `.dashboard`                                                             |
| `WEBSCREENSHOTS__AUTHOPTIONS__FORM__TIMEOUT_MS`      | Timeout in ms                             | `5000`                                                                   |

---

### Token-based Auth

| Variable                                     | Description      | Example Value   |
| -------------------------------------------- | ---------------- | --------------- |
| `WEBSCREENSHOTS__AUTHOPTIONS__TOKEN__HEADER` | Auth header name | `Authorization` |
| `WEBSCREENSHOTS__AUTHOPTIONS__TOKEN__VALUE`  | Auth token value | `Bearer abc123` |

---

_For additional configuration examples, see the documentation or sample config files._
