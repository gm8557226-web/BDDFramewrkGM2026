// Default Cucumber CLI configuration enables TypeScript support and discovers scenario glue.
module.exports = {
  default: [
    '--require-module ts-node/register',
    '--require step-definitions/**/*.ts',
    '--require hooks/**/*.ts',
    '--format progress',
  ].join(' '),
};
