// Step definitions connect readable Gherkin steps to reusable page-object actions.
import { Given, When, Then } from '@cucumber/cucumber';
import { appConfig } from '../config/config';
import type { CustomWorld } from '../utils/world';

Given('I navigate to the login page', async function (this: CustomWorld) {
  await this.loginPage.navigateToLoginPage();
});

When('I enter valid username and password', async function (this: CustomWorld) {
  await this.loginPage.enterUsername(appConfig.credentials.username);
  await this.loginPage.enterPassword(appConfig.credentials.password);
});

When('I enter invalid username and password', async function (this: CustomWorld) {
  await this.loginPage.enterUsername(appConfig.credentials.invalidUsername);
  await this.loginPage.enterPassword(appConfig.credentials.invalidPassword);
});

When('I click the login button', async function (this: CustomWorld) {
  await this.loginPage.clickLogin();
});

Then('I should be successfully logged in', async function (this: CustomWorld) {
  await this.loginPage.verifySuccessfulLogin();
});

Then('I should see a login error message', async function (this: CustomWorld) {
  await this.loginPage.verifyLoginError();
});
