import { describe, it, expect } from 'vitest';
import { validateConfig } from './validate-config';
import { deleteProperty } from '../utils/delete-property';

describe('validateConfig', () => {
  const baseConfig = {
    url: 'https://example.com',
    outputDir: 'screenshots',
    outputPattern: '{host}/{route}/{viewport}.{ext}',
    routes: ['/'],
    browserOptions: { headless: true },
    captureOptions: { imageType: 'jpeg', fullPage: true },
    viewports: [{ name: 'desktop', width: 1920, height: 1080 }],
    crawl: false,
    retryOptions: { maxAttempts: 3 },
  };

  const fullBaseConfig = {
    ...baseConfig,
    crawlOptions: {
      crawlLimit: 10,
      excludeRoutes: ['/private', '/login'],
      dynamicRoutesLimit: 5,
    },
    retryOptions: { maxAttempts: 3, delayMs: 500 },
    authOptions: {
      method: 'form',
      form: {
        loginUrl: 'https://example.com/login',
        inputs: { '#user': 'user' },
        submit: '#submit',
        timeoutMs: 3000,
      },
    },
  };

  it('passes validation for a minimal valid config', () => {
    expect(() => validateConfig(baseConfig)).not.toThrow();
  });

  [
    'url',
    'outputDir',
    'outputPattern',
    'routes',
    'browserOptions',
    'browserOptions.headless',
    'captureOptions.imageType',
    'captureOptions',
    'captureOptions.fullPage',
    'captureOptions.imageType',
    'viewports',
    'viewports[].name',
    'viewports[].width',
    'viewports[].height',
    'crawl',
    'retryOptions.maxAttempts',
    'authOptions.method',
  ].forEach((fieldPath) => {
    it(`fails validation when required field "${fieldPath}" is missing`, () => {
      const invalidConfig = JSON.parse(JSON.stringify(fullBaseConfig));
      const pathParts = fieldPath.split('.');

      deleteProperty(invalidConfig, pathParts);

      expect(() => validateConfig(invalidConfig)).toThrow(new RegExp(pathParts[pathParts.length - 1], 'i'));
    });
  });

  it('fails when a field has the wrong type', () => {
    const invalidConfig = { ...baseConfig, outputDir: 123 as any };
    expect(() => validateConfig(invalidConfig)).toThrow(/outputDir/i);
  });

  it('fails when url is not a valid URI', () => {
    const invalidConfig = { ...baseConfig, url: 'not-a-url' };
    expect(() => validateConfig(invalidConfig)).toThrow(/url/i);
  });

  it('fails validation if viewports array is empty', () => {
    const invalidConfig = { ...fullBaseConfig, viewports: [] };
    expect(() => validateConfig(invalidConfig)).toThrow(/viewports/i);
  });

  it('passes validation for a fully populated valid config', () => {
    expect(() => validateConfig(fullBaseConfig)).not.toThrow();
  });

  describe('authentication method validation', () => {
    const authTestCases = {
      basic: ['authOptions.basic.username', 'authOptions.basic.password'],
      cookie: ['authOptions.cookiesPath'],
      form: ['authOptions.form.loginUrl', 'authOptions.form.inputs', 'authOptions.form.submit'],
      token: ['authOptions.token.header', 'authOptions.token.value'],
    };

    Object.entries(authTestCases).forEach(([method, requiredFields]) => {
      describe(`method: ${method}`, () => {
        requiredFields.forEach((fieldPath) => {
          it(`fails validation when required field "${fieldPath}" is missing`, () => {
            const config: any = {
              ...fullBaseConfig,
              authOptions: {
                method,
                basic: { username: 'user', password: 'pass' },
                cookiesPath: './cookies.json',
                form: {
                  loginUrl: 'https://example.com/login',
                  inputs: { '#username': 'user', '#password': 'pass' },
                  submit: '#submit',
                  timeoutMs: 3000,
                },
                token: { header: 'Authorization', value: 'Bearer abc123' },
              },
            };

            const pathParts = fieldPath.split('.');
            deleteProperty(config, pathParts);

            expect(() => validateConfig(config)).toThrow(new RegExp(pathParts[pathParts.length - 1], 'i'));
          });
        });

        it(`passes validation when all required fields for "${method}" are provided`, () => {
          const validConfig: any = {
            ...fullBaseConfig,
            authOptions: {
              method,
              basic: { username: 'user', password: 'pass' },
              cookiesPath: './cookies.json',
              form: {
                loginUrl: 'https://example.com/login',
                inputs: { '#username': 'user', '#password': 'pass' },
                submit: '#submit',
                timeoutMs: 3000,
              },
              token: { header: 'Authorization', value: 'Bearer abc123' },
            },
          };
          expect(() => validateConfig(validConfig)).not.toThrow();
        });
      });
    });
  });
});
