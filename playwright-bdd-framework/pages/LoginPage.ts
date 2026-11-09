// The Page Object Model keeps login selectors and browser interactions in one place.
import type { Locator, Page } from 'playwright';
import { appConfig } from '../config/config';

export class LoginPage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly pageTitle: Locator;
  private readonly loginError: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.pageTitle = page.locator('[data-test="title"]');
    this.loginError = page.locator('[data-test="error"]');
  }

  async navigateToLoginPage(): Promise<void> {
    await this.page.goto(appConfig.baseUrl, { waitUntil: 'domcontentloaded' });
  }

  async enterUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  async enterPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  async verifySuccessfulLogin(): Promise<void> {
    await this.page.waitForURL('**/inventory.html', { timeout: appConfig.timeout });
    const title = await this.pageTitle.textContent();

    if (title?.trim() !== 'Products') {
      throw new Error(`Expected the inventory page title to be "Products", received "${title?.trim() ?? ''}".`);
    }
  }

  async verifyLoginError(): Promise<void> {
    const errorMessage = await this.loginError.textContent();

    if (!errorMessage?.includes('Username and password do not match')) {
      throw new Error(`Expected an invalid-credentials message, received "${errorMessage?.trim() ?? ''}".`);
    }
  }
}
