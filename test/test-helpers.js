const knex = require("knex");

function makeKnexInstance() {
  return knex({
    client: "pg",
    connection: process.env.TEST_DATABASE_URL,
  });
}

function cleanTables(db) {
  return db.raw(
    `TRUNCATE
        logs,
        users,
        tags
        RESTART IDENTITY CASCADE`
  );
}

function makeLogsArray() {
  return [
    {
      id: 1,
      log_name: "React",
      description: "some info about react",
      url: "https://reactjs.org/",
      num_tags: 1,
      date_created: "2020-04-09T13:56:23.223Z",
    },
    {
      id: 2,
      log_name: "Node",
      description: "some info about Node",
      url: "https://nodejs.org/en//",
      num_tags: 1,
      date_created: "2020-04-09T13:56:23.223Z",
    },
    {
      id: 3,
      log_name: "Express",
      description: "some info about express",
      url: "https://expressjs.com/",
      num_tags: 1,
      date_created: "2020-04-09T13:56:23.223Z",
    },
    {
      id: 4,
      log_name: "Getting started with express",
      description: "some info about express getting started",
      url: "https://expressjs.com/en/starter/installing.html",
      num_tags: 2,
      date_created: "2020-04-09T13:56:23.223Z",
    },
    {
      id: 5,
      log_name: "React",
      description: "some info about react",
      url: "https://reactjs.org/",
      num_tags: 1,
      date_created: "2020-04-09T13:56:23.223Z",
    },
  ];
}

function makeTestData() {
  const testLogs = makeLogsArray();
  return { testLogs };
}

function seedLogsTables(db, logs) {
  return db.into("logs").insert(logs);
}

module.exports = {
  cleanTables,

  makeKnexInstance,
  makeLogsArray,
  makeTestData,

  seedLogsTables,
};
