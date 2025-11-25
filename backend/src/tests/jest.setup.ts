import { sequelize } from '../config/database';

const originalWarn = console.warn;
const SILENCED_WARNINGS = [
  "SQLite does not support 'INTEGER' with UNSIGNED",
];

const filteredWarn: typeof console.warn = (...args) => {
  const message = args[0];
  if (typeof message === 'string' && SILENCED_WARNINGS.some((text) => message.includes(text))) {
    return;
  }
  originalWarn(...args);
};

console.warn = filteredWarn;

afterAll(async () => {
  console.warn = originalWarn;
  await sequelize.close();
});