import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { LogService } from '../services/log-service.js';
import { cleanObject, getString, getBoolean, getNumber, getJson } from './config-utils.js';
import { Viewport, WebscreenshotsConfig } from './config.types.js';
import { validateConfig } from './validate-config.js';

dotenv.config();

const DEFAULT_CONFIG: WebscreenshotsConfig = {
  url: '',
  outputDir: 'screenshots',
  outputPattern: '{host}/{viewport}/{host}-{viewport}-{route}.{ext}',
  routes: [''],

  browserOptions: {
    headless: true,
    args: undefined,
  },

  captureOptions: {
    fullPage: true,
    imageType: 'png',
    quality: undefined,
  },

  viewports: [
    {
      name: 'desktop',
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    },
  ],

  crawl: false,
  crawlOptions: undefined,

  retryOptions: {
    maxAttempts: 3,
    delayMs: 0,
  },
};

export async function getConfig(
  logService: LogService,
  overrides: Partial<WebscreenshotsConfig> = {},
  configPath?: string
): Promise<WebscreenshotsConfig> {
  const fileConfig = await loadConfigFromFile(logService, configPath);
  const envConfig = loadConfigFromEnv(logService);

  const mergedConfig = {
    url: overrides.url ?? envConfig.url ?? fileConfig.url ?? DEFAULT_CONFIG.url,
    outputDir: overrides.outputDir ?? envConfig.outputDir ?? fileConfig.outputDir ?? DEFAULT_CONFIG.outputDir,
    outputPattern:
      overrides.outputPattern ?? envConfig.outputPattern ?? fileConfig.outputPattern ?? DEFAULT_CONFIG.outputPattern,
    routes: overrides.routes ?? envConfig.routes ?? fileConfig.routes ?? DEFAULT_CONFIG.routes,

    browserOptions: {
      ...DEFAULT_CONFIG.browserOptions,
      ...fileConfig.browserOptions,
      ...envConfig.browserOptions,
      ...overrides.browserOptions,
    },

    captureOptions: {
      ...DEFAULT_CONFIG.captureOptions,
      ...fileConfig.captureOptions,
      ...envConfig.captureOptions,
      ...overrides.captureOptions,
    },

    viewports: overrides.viewports ?? envConfig.viewports ?? fileConfig.viewports ?? DEFAULT_CONFIG.viewports,

    crawl: overrides.crawl ?? envConfig.crawl ?? fileConfig.crawl ?? DEFAULT_CONFIG.crawl,
    crawlOptions: cleanObject({
      ...DEFAULT_CONFIG.crawlOptions,
      ...fileConfig.crawlOptions,
      ...envConfig.crawlOptions,
      ...overrides.crawlOptions,
    }),

    retryOptions: {
      ...DEFAULT_CONFIG.retryOptions,
      ...fileConfig.retryOptions,
      ...envConfig.retryOptions,
      ...overrides.retryOptions,
    },

    authOptions: cleanObject({ ...fileConfig.authOptions, ...envConfig.authOptions, ...overrides.authOptions }),
  };

  validateConfig(mergedConfig);

  return mergedConfig;
}

export async function loadConfigFromFile(
  logService: LogService,
  configPath?: string
): Promise<Partial<WebscreenshotsConfig>> {
  const defaultPaths = ['webscreenshots.json', 'webscreenshots.config.js', 'webscreenshots.config.ts'];

  const resolvedPath = configPath
    ? path.resolve(process.cwd(), configPath)
    : defaultPaths.map((p) => path.resolve(process.cwd(), p)).find((p) => fs.existsSync(p));

  if (!resolvedPath) {
    logService.info('No config file found, using defaults');
    return {};
  }

  try {
    if (resolvedPath.endsWith('.json')) {
      const raw = fs.readFileSync(resolvedPath, 'utf-8');
      logService.success(`Loaded config from ${resolvedPath}`);
      return JSON.parse(raw);
    } else {
      const imported = await import(pathToFileURL(resolvedPath).href);
      logService.success(`Loaded config from ${resolvedPath}`);
      return imported.default ?? imported;
    }
  } catch (error) {
    logService.error(
      `Failed to load config from ${resolvedPath}: ${error instanceof Error ? error.message : String(error)}\n`
    );
    process.exit(1);
  }
}

export function loadConfigFromEnv(logService: LogService): Partial<WebscreenshotsConfig> {
  const env = process.env;

  const rawConfig = {
    url: getString(env, 'WEBSCREENSHOTS__URL'),
    outputDir: getString(env, 'WEBSCREENSHOTS__OUTPUTDIR'),
    outputPattern: getString(env, 'WEBSCREENSHOTS__OUTPUTPATTERN'),
    routes: getString(env, 'WEBSCREENSHOTS__ROUTES')?.split(','),

    browserOptions: {
      headless: getBoolean(env, 'WEBSCREENSHOTS__BROWSEROPTIONS__HEADLESS'),
      args: getString(env, 'WEBSCREENSHOTS__BROWSEROPTIONS__ARGS')?.split(','),
    },

    captureOptions: {
      fullPage: getBoolean(env, 'WEBSCREENSHOTS__CAPTUREOPTIONS__FULLPAGE'),
      imageType: getString(env, 'WEBSCREENSHOTS__CAPTUREOPTIONS__IMAGETYPE'),
      quality: getNumber(env, 'WEBSCREENSHOTS__CAPTUREOPTIONS__QUALITY'),
    },

    viewports: getJson<Viewport[]>(env, 'WEBSCREENSHOTS__VIEWPORTS'),

    crawl: getBoolean(env, 'WEBSCREENSHOTS__CRAWL'),
    crawlOptions: {
      crawlLimit: getNumber(env, 'WEBSCREENSHOTS__CRAWLOPTIONS__CRAWLLIMIT'),
      excludeRoutes: getString(env, 'WEBSCREENSHOTS__CRAWLOPTIONS__EXCLUDEROUTES')?.split(','),
      dynamicRoutesLimit: getNumber(env, 'WEBSCREENSHOTS__CRAWLOPTIONS__DYNAMICROUTESLIMIT'),
    },

    retryOptions: {
      maxAttempts: getNumber(env, 'WEBSCREENSHOTS__RETRYOPTIONS__MAXATTEMPTS'),
      delayMs: getNumber(env, 'WEBSCREENSHOTS__RETRYOPTIONS__DELAYMS'),
    },

    authOptions: {
      method: getString(env, 'WEBSCREENSHOTS__AUTHOPTIONS__METHOD'),

      basic: {
        username: getString(env, 'WEBSCREENSHOTS__AUTHOPTIONS__BASIC__USERNAME'),
        password: getString(env, 'WEBSCREENSHOTS__AUTHOPTIONS__BASIC__PASSWORD'),
      },

      cookiesPath: getString(env, 'WEBSCREENSHOTS__AUTHOPTIONS__COOKIESPATH'),

      form: {
        loginUrl: getString(env, 'WEBSCREENSHOTS__AUTHOPTIONS__FORM__LOGINURL'),
        inputs: getJson<Record<string, string>>(env, 'WEBSCREENSHOTS__AUTHOPTIONS__FORM__INPUTS'),
        submit: getString(env, 'WEBSCREENSHOTS__AUTHOPTIONS__FORM__SUBMIT'),
        errorSelector: getString(env, 'WEBSCREENSHOTS__AUTHOPTIONS__FORM__ERRORSELECTOR'),
        successSelector: getString(env, 'WEBSCREENSHOTS__AUTHOPTIONS__FORM__SUCCESSSELECTOR'),
        timeoutMs: getNumber(env, 'WEBSCREENSHOTS__AUTHOPTIONS__FORM__TIMEOUT_MS'),
      },

      token: {
        header: getString(env, 'WEBSCREENSHOTS__AUTHOPTIONS__TOKEN__HEADER'),
        value: getString(env, 'WEBSCREENSHOTS__AUTHOPTIONS__TOKEN__VALUE'),
      },

      isAuthenticatedCheck: {
        url: getString(env, 'WEBSCREENSHOTS__AUTHOPTIONS__ISAUTHENTICATEDCHECK__URL'),
        selector: getString(env, 'WEBSCREENSHOTS__AUTHOPTIONS__ISAUTHENTICATEDCHECK__SELECTOR'),
        notFoundMeansUnauthenticated: getBoolean(
          env,
          'WEBSCREENSHOTS__AUTHOPTIONS__ISAUTHENTICATEDCHECK__NOTFOUNDMEANSUNAUTHENTICATED'
        ),
      },
    },
  };

  var config = cleanObject(rawConfig);

  if (Object.keys(config ?? {}).length > 0) {
    logService.success('Loaded config from environment variables\n');
  } else {
    logService.info('No environment variables found\n');
  }

  return config ?? {};
}
