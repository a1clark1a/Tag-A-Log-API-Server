module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL:
    process.env.DATABASE_URL || "postgresql://ac_perfecto@localhost/techlog",
  TEST_DATABASE_URL:
    process.env.TEST_DATABASE_URL ||
    "postgresql://ac_perfecto@localhost/techlog-test",
  JWT_SECRET: process.env.JWT_SECRET || "secret-to-change",
};
