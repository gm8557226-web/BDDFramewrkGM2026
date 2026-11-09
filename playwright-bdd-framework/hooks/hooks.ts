// Hooks manage browser lifecycle around each Cucumber scenario and save failure evidence.
import { After, Before, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { appConfig, browserTypes } from '../config/config';
import { playwrightLaunchOptions } from '../playwright.config';
import { LoginPage } from '../pages/LoginPage';
import { CustomWorld } from '../utils/world';

setDefaultTimeout(appConfig.timeout);

Before(async function (this: CustomWorld) {
  // Browser is the browser engine; BrowserContext is an isolated session for this scenario.
  this.browser = await browserTypes[appConfig.browser].launch(playwrightLaunchOptions);
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
  this.loginPage = new LoginPage(this.page);
});

After(async function (this: CustomWorld, scenario) {
  let hookError: unknown;

  try {
    if (scenario.result?.status === Status.FAILED && this.page) {
      const screenshotDirectory = path.resolve(process.cwd(), 'screenshots');
      await mkdir(screenshotDirectory, { recursive: true });

      const safeScenarioName = scenario.pickle.name.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-|-$/g, '');
      const screenshotPath = path.join(
        screenshotDirectory,
        `${safeScenarioName}-${Date.now()}.png`,
      );
      const screenshot = await this.page.screenshot({ path: screenshotPath, fullPage: true });
      await this.attach(screenshot, 'image/png');
    }
  } catch (error) {
    hookError = error;
  } finally {
    for (const resource of [this.page, this.context, this.browser]) {
      if (resource) {
        try {
          await resource.close();
        } catch (error) {
          hookError ??= error;
        }
      }
    }
  }

  if (hookError) {
    throw hookError;
  }
});
