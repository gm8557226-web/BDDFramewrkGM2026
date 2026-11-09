// These are Playwright browser launch options used by Cucumber hooks, not Playwright Test settings.
import type { LaunchOptions } from 'playwright';
import { appConfig } from './config/config';

export const playwrightLaunchOptions: LaunchOptions = {
  headless: appConfig.headless,
  timeout: appConfig.timeout,
};

export default playwrightLaunchOptions;
