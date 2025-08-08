import { AuthMethod, AuthOptions, RetryOptions } from '../config/config.types.js';
import { BrowserService } from '../services/browser-service.js';
import { LogService } from '../services/log-service.js';
import { sleep } from '../utils/sleep.js';

export const AllowedAuthMethods: AuthMethod[] = ['basic', 'cookie', 'form', 'token'];

export async function authenticate(
  browserService: BrowserService,
  logService: LogService,
  authOptions: AuthOptions,
  retryOptions: RetryOptions
): Promise<boolean> {
  logService.start('🔐 Authenticating');

  const authMethod = authOptions.method;
  if (!authMethod) {
    logService.info('No authentication method has been configured');
    return false;
  }

  if (!AllowedAuthMethods.includes(authMethod)) {
    logService.info(`'${authMethod}' is not supported`);
    return false;
  }

  switch (authMethod) {
    case 'basic':
      if (!(authOptions.basic?.username && authOptions.basic.password)) {
        logService.error(`Missing 'username' or 'password' in basic auth configuration`);
        return false;
      }
      logService.info('Authentication will happen on each page');
      return await browserService.setAuthentication(authOptions);
    case 'token':
      if (!(authOptions.token?.header && authOptions.token.value)) {
        logService.error(`Missing 'header' or 'value' in token auth configuration`);
        return false;
      }
      logService.info('Authentication will happen on each page');
      return await browserService.setAuthentication(authOptions);
    case 'cookie':
      if (!authOptions.cookiesPath) {
        logService.error(`Missing 'cookiesPath' in cookie auth configuration`);
        return false;
      }
      break;
    case 'form':
      if (!(authOptions.form?.loginUrl && authOptions.form.inputs && authOptions.form.submit)) {
        logService.error(`Invalid form configuration. Ensure 'loginUrl', 'inputs' and 'submit' are set`);
        return false;
      }
      break;
  }

  const { maxAttempts = 1, delayMs = 0 } = retryOptions;
  let attempt = 0;

  while (attempt < maxAttempts) {
    try {
      attempt++;
      if (attempt > 1) {
        logService.log(`🔁 Retry (${attempt}/${maxAttempts})`);
      }

      var success = await browserService.setAuthentication(authOptions);
      if (success) return true;
    } catch (error) {
      if (attempt >= maxAttempts) {
        logService.error(`Failed to authenticate`);
        logService.log(`↳ Reason: ${error instanceof Error ? error.message : String(error)}\n`);
      }
    }

    if (attempt < maxAttempts && delayMs > 0) {
      await sleep(delayMs);
    }
  }

  logService.error(`Failed to authenticate`);
  return false;
}
