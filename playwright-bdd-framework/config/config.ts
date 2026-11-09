// Central configuration loads the selected dotenv file and validates required settings.
import dotenv from 'dotenv';
import path from 'node:path';
import { chromium, firefox, webkit, type BrowserType } from 'playwright';

export type BrowserName = 'chromium' | 'firefox' | 'webkit';

const selectedEnvironment = process.env.TEST_ENV ?? 'qa';
if (selectedEnvironment !== 'qa' && selectedEnvironment !== 'uat') {
  throw new Error(`Unsupported TEST_ENV "${selectedEnvironment}". Choose "qa" or "uat".`);
}

const environmentPath = path.resolve(process.cwd(), 'config', `.env.${selectedEnvironment}`);
const environmentResult = dotenv.config({ path: environmentPath });
if (environmentResult.error) {
  throw new Error(`Could not load environment file "${environmentPath}": ${environmentResult.error.message}`);
}
const environmentFileValues = environmentResult.parsed ?? {};

function requiredEnvironmentValue(name: string): string {
  // Windows reserves USERNAME for the signed-in account; prefer the test value in dotenv.
  const value = process.env[`TEST_${name}`]
    ?? (name === 'USERNAME'
      ? environmentFileValues[name] ?? process.env[name]
      : process.env[name] ?? environmentFileValues[name]);
  if (!value) {
    throw new Error(`Missing required environment variable "${name}" in ${environmentPath}.`);
  }
  return value;
}

function parseBrowserName(value: string | undefined): BrowserName {
  const browser = value ?? 'chromium';
  if (browser !== 'chromium' && browser !== 'firefox' && browser !== 'webkit') {
    throw new Error(`Unsupported BROWSER "${browser}". Choose chromium, firefox, or webkit.`);
  }
  return browser;
}

function parseTimeout(value: string | undefined): number {
  const timeout = Number(value ?? 30_000);
  if (!Number.isInteger(timeout) || timeout <= 0) {
    throw new Error(`TIMEOUT must be a positive integer in milliseconds; received "${value}".`);
  }
  return timeout;
}

function parseHeadless(value: string | undefined): boolean {
  if (value === undefined) return true;
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;
  throw new Error(`HEADLESS must be "true" or "false"; received "${value}".`);
}

export const appConfig = {
  environment: selectedEnvironment,
  baseUrl: requiredEnvironmentValue('BASE_URL'),
  browser: parseBrowserName(process.env.BROWSER),
  headless: parseHeadless(process.env.HEADLESS),
  timeout: parseTimeout(process.env.TIMEOUT),
  credentials: {
    username: requiredEnvironmentValue('USERNAME'),
    password: requiredEnvironmentValue('PASSWORD'),
    invalidUsername: requiredEnvironmentValue('INVALID_USERNAME'),
    invalidPassword: requiredEnvironmentValue('INVALID_PASSWORD'),
  },
};

export const browserTypes: Record<BrowserName, BrowserType> = {
  chromium,
  firefox,
  webkit,
};
