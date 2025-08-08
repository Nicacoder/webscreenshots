import fs from 'fs/promises';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import puppeteer, { Browser, CookieData, ImageFormat, Page, Viewport } from 'puppeteer';
import { BrowserOptions, AuthOptions, CaptureOptions } from '../../config/config.types.js';
import { sleep } from '../../utils/sleep.js';
import { BrowserService } from '../browser-service.js';
import { LogService } from '../log-service.js';

export class PuppeteerBrowserService implements BrowserService {
  private logService: LogService;
  private browser?: Browser;
  private options: BrowserOptions;
  private authOptions?: AuthOptions;
  private authenticateOnEachPage = false;

  constructor(logService: LogService, options: BrowserOptions) {
    this.logService = logService;
    this.options = options;
  }

  async extractLinks(url: string): Promise<string[]> {
    const browser = this.browser ?? (await this.initBrowser(this.options));
    const page = await browser.newPage();
    try {
      if (this.authenticateOnEachPage) await this.authenticatePage(page, this.authOptions!);
      await page.goto(url, { waitUntil: 'networkidle2' });
      const links = await page.$$eval('a[href]', (anchors) => anchors.map((a) => (a as HTMLAnchorElement).href));
      return Array.from(new Set(links));
    } finally {
      await page.close();
    }
  }

  async captureScreenshot(
    url: string,
    outputPath: string,
    captureOptions: CaptureOptions,
    viewport?: Viewport
  ): Promise<void> {
    const browser = this.browser ?? (await this.initBrowser(this.options));
    const page = await browser.newPage();
    try {
      const dir = path.dirname(outputPath);
      if (!existsSync(dir)) await fs.mkdir(dir, { recursive: true });
      if (viewport) await page.setViewport(viewport);
      if (this.authenticateOnEachPage) await this.authenticatePage(page, this.authOptions!);
      await page.goto(url, { waitUntil: 'networkidle2' });
      await page.screenshot({
        path: outputPath as `${string}.${ImageFormat}`,
        fullPage: captureOptions.fullPage,
        type: captureOptions.imageType,
        quality: captureOptions.quality,
      });
    } finally {
      await page.close();
    }
  }

  async setAuthentication(authOptions?: AuthOptions): Promise<boolean> {
    this.authOptions = authOptions;
    this.authenticateOnEachPage = authOptions?.method == 'basic' || authOptions?.method == 'token';
    if (!authOptions) return true;
    if (this.authenticateOnEachPage) return true;

    switch (authOptions.method) {
      case 'cookie': {
        return await this.authenticateWithCookies(authOptions.cookiesPath!);
      }

      case 'form': {
        return await this.authenticateWithForm(authOptions.form!);
      }
    }

    return false;
  }

  async cleanup(): Promise<void> {
    if (!this.browser) return;
    await this.browser.close();
    this.browser = undefined;
  }

  private async initBrowser(overrideOptions: BrowserOptions): Promise<Browser> {
    if (this.browser) await this.cleanup();
    return (this.browser = await puppeteer.launch({
      headless: overrideOptions.headless,
      args: overrideOptions.args,
    }));
  }

  private async authenticatePage(page: Page, options: AuthOptions): Promise<boolean> {
    switch (options?.method) {
      case 'basic':
        return await this.authenticateWithBasicAuthentication(page, options.basic);
      case 'token':
        return await this.authenticatePageWithToken(page, options.token);
    }

    return false;
  }

  private async authenticateWithBasicAuthentication(page: Page, options: AuthOptions['basic']): Promise<boolean> {
    if (!options?.username || !options.password) return false;
    await page.authenticate({
      username: options.username,
      password: options.password,
    });
    this.logService.log('🔐 Basic authentication set.');
    return true;
  }

  private async authenticatePageWithToken(page: Page, options: AuthOptions['token']): Promise<boolean> {
    if (!options?.header || !options.value) return false;
    await page.setExtraHTTPHeaders({ [options.header]: options.value });
    this.logService.log('🔐 Token authentication set.');
    return true;
  }

  private async authenticateWithCookies(cookiesPath: string): Promise<boolean> {
    if (!existsSync(cookiesPath)) {
      this.logService.warning(`Cookie file not found: ${cookiesPath}`);
      return false;
    }

    const raw = readFileSync(cookiesPath, 'utf-8');
    let cookies: CookieData[];
    try {
      cookies = JSON.parse(raw);
    } catch (error) {
      this.logService.error(
        `Failed to parse cookies from ${cookiesPath}: ${error instanceof Error ? error.message : error}`
      );
      return false;
    }

    if (!cookies.length) {
      this.logService.warning('No cookies found in cookiesPath.');
      return false;
    }

    const browser = this.browser ?? (await this.initBrowser(this.options));
    try {
      await browser.setCookie(...cookies);

      const browserCookies = await browser.cookies();
      if (browserCookies.length != cookies.length) {
        this.logService.error(
          `Failed to set cookies: provided ${cookies.length}, but ${browserCookies.length} were applied.`
        );
        return false;
      }

      this.logService.success(`Successfully applied ${browserCookies.length} cookies.`);
      return true;
    } catch (error) {
      this.logService.error(`Failed to set cookies: ${error instanceof Error ? error.message : error}`);
      return false;
    }
  }

  private async authenticateWithForm(options: AuthOptions['form']): Promise<boolean> {
    if (!options) {
      this.logService.warning('No form options provided for form authentication.');
      return false;
    }

    const { loginUrl, inputs, submit, successSelector, errorSelector, timeoutMs = 5000 } = options;
    if (!loginUrl || !inputs || !submit) {
      this.logService.error('Form auth missing required fields (loginUrl, inputs, submit).');
      return false;
    }

    const browser = this.browser ?? (await this.initBrowser(this.options));
    const page = await browser.newPage();

    try {
      await page.goto(loginUrl, { waitUntil: 'networkidle2' });

      for (const [selector, value] of Object.entries(inputs)) {
        await page.waitForSelector(selector, { timeout: timeoutMs });
        await page.type(selector, value);
      }

      const navigationHappened = await Promise.all([
        page.click(submit),
        Promise.race([
          page.waitForNavigation({ waitUntil: 'networkidle2', timeout: timeoutMs }).catch(() => null),
          sleep(timeoutMs),
        ]),
      ]);

      if (!navigationHappened) {
        this.logService.warning('No navigation after login attempt.');
      }

      if (successSelector) {
        const successElement = await page.$(successSelector);
        this.logService.success('Success element found. Authentication succeeded.');
        if (successElement) return true;
      }

      if (errorSelector) {
        const errorElement = await page.$(errorSelector);
        if (errorElement) {
          this.logService.error('Login error element detected.');
          return false;
        }
      }

      const newUrl = page.url();
      const loginOrigin = new URL(loginUrl).origin;
      if (!newUrl.startsWith(loginOrigin) || newUrl !== loginUrl) {
        this.logService.success('Page redirect detected — authentication likely succeeded.');
        return true;
      }

      this.logService.warning('Login may not have succeeded (URL unchanged and no success marker found).');
      return false;
    } catch (error) {
      this.logService.error(`Form authentication failed: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    } finally {
      await page.close();
    }
  }
}
