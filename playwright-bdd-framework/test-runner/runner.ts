// The Cucumber CLI is the BDD runner; this script adds defaults and creates the HTML report.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import reporter = require('cucumber-html-reporter');
import { appConfig } from '../config/config';

const projectRoot = process.cwd();
const reportDirectory = path.resolve(projectRoot, 'reports');
const jsonReportPath = path.join(reportDirectory, 'cucumber-report.json');
const jsonReportArgument = path.relative(projectRoot, jsonReportPath).replace(/\\/g, '/');
const cucumberCliPath = path.resolve(projectRoot, 'node_modules', '@cucumber', 'cucumber', 'bin', 'cucumber.js');

mkdirSync(reportDirectory, { recursive: true });

const forwardedArguments = process.argv.slice(2);
const headedFlagIndex = forwardedArguments.indexOf('--headed');
if (headedFlagIndex !== -1) {
  process.env.HEADLESS = 'false';
  forwardedArguments.splice(headedFlagIndex, 1);
}

const hasFeaturePath = forwardedArguments.some((argument) => {
  if (argument.startsWith('-')) return false;
  return existsSync(path.resolve(projectRoot, argument));
});
const cucumberArguments = [
  '--format',
  `json:${jsonReportArgument}`,
  ...(hasFeaturePath ? [] : ['features/**/*.feature']),
  ...forwardedArguments,
];

const cucumberResult = spawnSync(process.execPath, [cucumberCliPath, ...cucumberArguments], {
  cwd: projectRoot,
  env: process.env,
  stdio: 'inherit',
});

if (cucumberResult.error) {
  throw new Error(`Could not start Cucumber: ${cucumberResult.error.message}`, { cause: cucumberResult.error });
}

if (cucumberResult.status === null) {
  throw new Error('Cucumber ended without an exit status.');
}

if (!existsSync(jsonReportPath)) {
  if (cucumberResult.status !== 0) {
    process.exitCode = cucumberResult.status;
    throw new Error(`Cucumber did not produce the expected JSON report: ${jsonReportPath}`);
  }
  throw new Error(`Cucumber completed without creating the expected JSON report: ${jsonReportPath}`);
}

// The generated report summarizes features, scenarios, steps, timing, errors, and attached screenshots.
reporter.generate({
  jsonFile: jsonReportPath,
  output: path.join(reportDirectory, 'cucumber-report.html'),
  theme: 'bootstrap',
  name: 'Cucumber BDD Test Report',
  brandTitle: 'Cucumber BDD Test Report',
  reportSuiteAsScenarios: true,
  scenarioTimestamp: true,
  screenshotsDirectory: path.resolve(projectRoot, 'screenshots'),
  storeScreenshots: true,
  launchReport: false,
});

process.exitCode = cucumberResult.status;

console.log(`\nEnvironment: ${appConfig.environment}`);
console.log(`HTML report: ${path.join(reportDirectory, 'cucumber-report.html')}`);
