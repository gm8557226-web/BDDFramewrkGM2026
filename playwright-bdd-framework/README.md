# Playwright BDD Framework

A beginner-friendly browser automation framework that uses Playwright for browser control and Cucumber as the BDD test runner. The Cucumber scenarios do **not** run through the Playwright Test runner.

## A. Project architecture

```text
playwright-bdd-framework/
├── features/
│   └── login.feature
├── step-definitions/
│   └── login.steps.ts
├── pages/
│   └── LoginPage.ts
├── hooks/
│   └── hooks.ts
├── cucumber.js
├── config/
│   ├── .env.qa
│   ├── .env.uat
│   └── config.ts
├── test-runner/
│   └── runner.ts
├── utils/
│   └── world.ts
├── reports/
│   └── .gitkeep
├── screenshots/
│   └── .gitkeep
├── playwright.config.ts
├── tsconfig.json
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

### Folder and file roles

- `features/login.feature` — Gherkin specification: plain-language `Given`, `When`, and `Then` steps describe the expected behavior. `@smoke` and `@regression` tags support focused runs.
- `step-definitions/login.steps.ts` — Cucumber glue code maps each Gherkin step to a typed Playwright page-object action.
- `pages/LoginPage.ts` — Page Object Model for SauceDemo login: selectors, UI interactions, and outcome checks live here rather than in the feature or step definitions.
- `hooks/hooks.ts` — Cucumber `Before` and `After` hooks create and close the browser session. A failed scenario gets a full-page screenshot saved locally and attached to its Cucumber result.
- `cucumber.js` — Default Cucumber CLI configuration loads TypeScript step definitions and hooks, so both the wrapper and direct `npx cucumber-js` commands work.
- `config/config.ts` — Loads the selected dotenv file and validates the base URL, credentials, browser, headless setting, and timeout.
- `config/.env.qa` / `config/.env.uat` — Environment-specific sample test settings. Replace values as appropriate for your own environments.
- `test-runner/runner.ts` — Starts the Cucumber CLI with TypeScript step definitions and hooks, then generates a readable HTML report from the JSON results.
- `utils/world.ts` — Defines a Cucumber World, the scenario-scoped context for the Playwright `Browser`, `BrowserContext`, `Page`, and page object.
- `playwright.config.ts` — Exposes Playwright browser launch options used by the Cucumber hooks. It is not a Playwright Test configuration.
- `reports/` — Receives the JSON and HTML Cucumber reports.
- `screenshots/` — Receives screenshots captured for failed scenarios.
- `tsconfig.json` — Strict TypeScript compiler settings for the framework.
- `package.json` — Dependencies and npm commands.

## B. Installation

Open a terminal in the project directory:

```bash
npm install
```

## C. Install Playwright browsers

Install the default Chromium browser:

```bash
npx playwright install chromium
```

For Firefox or WebKit, install them as well:

```bash
npx playwright install firefox webkit
```

## D. Configure environments

The framework reads `TEST_ENV` and loads `config/.env.qa` by default. Choose UAT with:

```bash
# macOS/Linux
TEST_ENV=uat npm run test:bdd

# Windows PowerShell
$env:TEST_ENV = "uat"; npm run test:bdd
```

Each environment file supports `BASE_URL`, `USERNAME`, `PASSWORD`, `INVALID_USERNAME`, `INVALID_PASSWORD`, `BROWSER`, `HEADLESS`, and `TIMEOUT`. `BROWSER` may be `chromium`, `firefox`, or `webkit`; `HEADLESS` must be `true` or `false`; `TIMEOUT` is a positive number of milliseconds. Process environment values normally take precedence over file values. Because Windows reserves `USERNAME` for the signed-in account, the test username comes from the selected environment file by default; override it with `TEST_USERNAME`. Override other credentials with `TEST_PASSWORD`, `TEST_INVALID_USERNAME`, or `TEST_INVALID_PASSWORD`. Do not put real secrets in source control.

## E. Run all BDD tests

```bash
npm run test:bdd
```

The runner discovers feature files in `features/`, runs them through Cucumber, and writes JSON and HTML reports to `reports/`.

## F. Run a specific feature

```bash
npm run test:bdd -- features/login.feature
```

## G. Run a tag or specific scenario

Run the smoke scenario:

```bash
npm run test:bdd -- --tags "@smoke"
```

Run the regression scenario:

```bash
npm run test:bdd -- --tags "@regression"
```

You can also pass a Cucumber tag expression or feature path after `--`. The shared Cucumber configuration also makes the direct CLI command work:

```bash
npx cucumber-js --tags "@smoke"
```

## H. Run in headed mode

```bash
npm run test:bdd:headed
```

Alternatively, set `HEADLESS=false` in the environment. The runner's `--headed` option overrides the setting for that run.

## I. Generate and view the HTML report

Both `npm run test:bdd` and `npm run test:bdd:html` run the tests and generate:

- `reports/cucumber-report.html` — readable feature, scenario, step, status, duration, failure details, and attached screenshot output.
- `reports/cucumber-report.json` — Cucumber's machine-readable results used to build the HTML report.

Open `reports/cucumber-report.html` in a browser after the run. The report is generated even when a scenario fails, provided Cucumber produced its JSON results.

## J. Failure screenshots

After a failed scenario, the `After` hook takes a full-page PNG screenshot, saves it in `screenshots/`, and attaches its bytes to the Cucumber scenario result. The report generator includes Cucumber attachments in the HTML report. Hooks close the page, context, and browser whether the scenario passes or fails.

## K. End-to-end execution flow

1. Cucumber reads `features/login.feature` and selects scenarios by path or tag.
2. Cucumber matches each Gherkin step to a function in `step-definitions/login.steps.ts`.
3. The step definition calls `LoginPage` methods instead of duplicating UI logic.
4. `LoginPage` uses Playwright's `Page` API to locate elements and interact with SauceDemo.
5. Cucumber hooks create a Playwright `Browser`, an isolated `BrowserContext`, and a `Page` for each scenario.
6. Playwright drives the selected browser against the application and verifies the expected result.
7. Cucumber records step status, duration, and errors; on failure the hook captures and attaches a screenshot.
8. The runner converts the Cucumber JSON output into `reports/cucumber-report.html`.

```text
Feature File
     ↓
Cucumber
     ↓
Step Definition
     ↓
Page Object
     ↓
Playwright
     ↓
Browser
     ↓
Application
     ↓
Cucumber Report
```
