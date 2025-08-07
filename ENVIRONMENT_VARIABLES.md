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

_For additional configuration examples, see the documentation or sample config files._
