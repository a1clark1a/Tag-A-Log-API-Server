const knex = require("knex");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
        tags,
        log_tags
        RESTART IDENTITY CASCADE`
  );
}

function makeLogsArray(users) {
  return [
    {
      id: 1,
      log_name: "React",
      description: "some info about react",
      url: "https://reactjs.org/",
      num_tags: 1,
      date_created: new Date("2020-04-09T13:56:23.223Z"),
      user_id: users[0].id,
    },
    {
      id: 2,
      log_name: "Node",
      description: "some info about Node",
      url: "https://nodejs.org/en//",
      num_tags: 1,
      date_created: new Date("2020-04-09T13:56:23.223Z"),
      user_id: users[1].id,
    },
    {
      id: 3,
      log_name: "Express",
      description: "some info about express",
      url: "https://expressjs.com/",
      num_tags: 1,
      date_created: new Date("2020-04-09T13:56:23.223Z"),
      user_id: users[1].id,
    },
    {
      id: 4,
      log_name: "Getting started with express",
      description: "some info about express getting started",
      url: "https://expressjs.com/en/starter/installing.html",
      num_tags: 2,
      date_created: new Date("2020-04-09T13:56:23.223Z"),
      user_id: users[0].id,
    },
    {
      id: 5,
      log_name: "React",
      description: "some info about react",
      url: "https://reactjs.org/",
      num_tags: 1,
      date_created: new Date("2020-04-09T13:56:23.223Z"),
      user_id: users[1].id,
    },
    {
      id: 6,
      log_name: "React",
      description: "some info about react",
      url: "https://reactjs.org/",
      num_tags: 1,
      date_created: new Date("2020-04-09T13:56:23.223Z"),
      user_id: users[2].id,
    },
    {
      id: 7,
      log_name: "Node",
      description: "some info about node",
      url: "https://expressjs.com/",
      num_tags: 1,
      date_created: new Date("2020-04-09T13:56:23.223Z"),
      user_id: users[0].id,
    },
    {
      id: 8,
      log_name: "Log with no tag",
      description: "some info about this log",
      url: "https://expressjs.com/",
      num_tags: 0,
      date_created: new Date("2029-04-09T13:56:23.223Z"),
      user_id: users[0].id,
    },
  ];
}

function makeUsersArray() {
  return [
    {
      id: 1,
      user_name: "test-user-1",
      email: "test@gmail.com",
      password: "password",
      date_created: new Date("2029-01-22T16:28:32.615Z"),
    },

    {
      id: 2,
      user_name: "test-user-2",
      email: "fake@gmail.com",
      password: "password",
      date_created: new Date("2029-01-22T16:28:32.615Z"),
    },

    {
      id: 3,
      user_name: "test-user-3",
      email: "demo@gmail.com",
      password: "password",
      date_created: new Date("2029-01-22T16:28:32.615Z"),
    },
  ];
}

function makeTagsArray(users) {
  return [
    {
      id: 1,
      tag_name: "react",
      user_id: users[0].id,
      date_created: new Date("2029-01-22T16:28:32.615Z"),
    },
    {
      id: 2,
      tag_name: "node",
      user_id: users[1].id,
      date_created: new Date("2029-01-22T16:28:32.615Z"),
    },
    {
      id: 3,
      tag_name: "react",
      user_id: users[1].id,
      date_created: new Date("2029-01-22T16:28:32.615Z"),
    },
    {
      id: 4,
      tag_name: "node",
      user_id: users[0].id,
      date_created: new Date("2029-01-22T16:28:32.615Z"),
    },
    {
      id: 5,
      tag_name: "react",
      user_id: users[2].id,
      date_created: new Date("2029-01-22T16:28:32.615Z"),
    },
    {
      id: 6,
      tag_name: "express",
      user_id: users[0].id,
      date_created: new Date("2029-01-22T16:28:32.615Z"),
    },
    {
      id: 7,
      tag_name: "express",
      user_id: users[1].id,
      date_created: new Date("2029-01-22T16:28:32.615Z"),
    },
    {
      id: 8,
      tag_name: "getting-started",
      user_id: users[0].id,
      date_created: new Date("2029-01-22T16:28:32.615Z"),
    },
  ];
}

function makeLog_Tags() {
  return [
    {
      log_id: 1,
      tag_id: 1,
      date_tagged: new Date("2029-01-22T16:28:32.615Z"),
    },
    {
      log_id: 2,
      tag_id: 2,
      date_tagged: new Date("2029-01-22T16:28:32.615Z"),
    },
    {
      log_id: 3,
      tag_id: 7,
      date_tagged: new Date("2029-01-22T16:28:32.615Z"),
    },
    {
      log_id: 4,
      tag_id: 6,
      date_tagged: new Date("2029-01-22T16:28:32.615Z"),
    },
    {
      log_id: 4,
      tag_id: 8,
      date_tagged: new Date("2029-01-22T16:28:32.615Z"),
    },
    {
      log_id: 5,
      tag_id: 3,
      date_tagged: new Date("2029-01-22T16:28:32.615Z"),
    },
    {
      log_id: 6,
      tag_id: 5,
      date_tagged: new Date("2029-01-22T16:28:32.615Z"),
    },
    {
      log_id: 7,
      tag_id: 4,
      date_tagged: new Date("2029-01-22T16:28:32.615Z"),
    },
  ];
}

function makeExpectedLogsArray(users) {
  return [
    {
      id: 1,
      log_name: "React",
      description: "some info about react",
      url: "https://reactjs.org/",
      num_tags: 1,
      date_created: new Date("2020-04-09T13:56:23.223Z").toLocaleString(),
      user_id: users[0].id,
    },
    {
      id: 2,
      log_name: "Node",
      description: "some info about Node",
      url: "https://nodejs.org/en//",
      num_tags: 1,
      date_created: new Date("2020-04-09T13:56:23.223Z").toLocaleString(),
      user_id: users[1].id,
    },
    {
      id: 3,
      log_name: "Express",
      description: "some info about express",
      url: "https://expressjs.com/",
      num_tags: 1,
      date_created: new Date("2020-04-09T13:56:23.223Z").toLocaleString(),
      user_id: users[1].id,
    },
    {
      id: 4,
      log_name: "Getting started with express",
      description: "some info about express getting started",
      url: "https://expressjs.com/en/starter/installing.html",
      num_tags: 2,
      date_created: new Date("2020-04-09T13:56:23.223Z").toLocaleString(),
      user_id: users[0].id,
    },
    {
      id: 5,
      log_name: "React",
      description: "some info about react",
      url: "https://reactjs.org/",
      num_tags: 1,
      date_created: new Date("2020-04-09T13:56:23.223Z").toLocaleString(),
      user_id: users[1].id,
    },
    {
      id: 6,
      log_name: "React",
      description: "some info about react",
      url: "https://reactjs.org/",
      num_tags: 1,
      date_created: new Date("2020-04-09T13:56:23.223Z").toLocaleString(),
      user_id: users[2].id,
    },
    {
      id: 7,
      log_name: "Node",
      description: "some info about node",
      url: "https://expressjs.com/",
      num_tags: 1,
      date_created: new Date("2020-04-09T13:56:23.223Z").toLocaleString(),
      user_id: users[0].id,
    },
    {
      id: 8,
      log_name: "Log with no tag",
      description: "some info about this log",
      url: "https://expressjs.com/",
      num_tags: 0,
      date_created: new Date("2029-04-09T13:56:23.223Z").toLocaleString(),
      user_id: users[0].id,
    },
  ];
}

function makeExpectedTagsArray(users) {
  return [
    {
      id: 1,
      tag_name: "react",
      user_id: users[0].id,
      date_created: new Date("2029-01-22T16:28:32.615Z").toLocaleString(),
      log_tags: {},
    },
    {
      id: 2,
      tag_name: "node",
      user_id: users[1].id,
      date_created: new Date("2029-01-22T16:28:32.615Z").toLocaleString(),
      log_tags: {},
    },
    {
      id: 3,
      tag_name: "react",
      user_id: users[1].id,
      date_created: new Date("2029-01-22T16:28:32.615Z").toLocaleString(),
      log_tags: {},
    },
    {
      id: 4,
      tag_name: "node",
      user_id: users[0].id,
      date_created: new Date("2029-01-22T16:28:32.615Z").toLocaleString(),
      log_tags: {},
    },
    {
      id: 5,
      tag_name: "react",
      user_id: users[2].id,
      date_created: new Date("2029-01-22T16:28:32.615Z").toLocaleString(),
      log_tags: {},
    },
    {
      id: 6,
      tag_name: "express",
      user_id: users[0].id,
      date_created: new Date("2029-01-22T16:28:32.615Z").toLocaleString(),
      log_tags: {},
    },
    {
      id: 7,
      tag_name: "express",
      user_id: users[1].id,
      date_created: new Date("2029-01-22T16:28:32.615Z").toLocaleString(),
      log_tags: {},
    },
    {
      id: 8,
      tag_name: "getting-started",
      user_id: users[0].id,
      date_created: new Date("2029-01-22T16:28:32.615Z").toLocaleString(),
      log_tags: {},
    },
  ];
}

function makeExpectedUsersArray() {
  return [
    {
      id: 1,
      user_name: "test-user-1",
      email: "test@gmail.com",
      password: "password",
      date_created: "2029-01-22T16:28:32.615Z",
    },

    {
      id: 2,
      user_name: "test-user-2",
      email: "fake@gmail.com",
      password: "password",
      date_created: "2029-01-22T16:28:32.615Z",
    },

    {
      id: 3,
      user_name: "test-user-3",
      email: "demo@gmail.com",
      password: "password",
      date_created: "2029-01-22T16:28:32.615Z",
    },
  ];
}

function makeExpectedCleanedLog(log) {
  return {
    id: log.id,
    log_name: log.log_name,
    description: log.description,
    url: log.url,
    num_tags: 0,
    date_created: log.date_created,
    user_id: log.user_id,
  };
}

function makeMaliciousLog(user) {
  const maliciousLog = {
    id: 666,
    log_name: 'BAD TITLE BAD! <script>alert("xss");</script>',
    description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    url: "http://placehold.it/500x500",
    user_id: user.id,
    date_created: new Date().toLocaleString(),
  };

  const expectedLogForMalic = {
    ...makeExpectedCleanedLog(maliciousLog),
    log_name: 'BAD TITLE BAD! &lt;script&gt;alert("xss");&lt;/script&gt;',
    description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
  };

  return {
    maliciousLog,
    expectedLogForMalic,
  };
}

function makeTestData() {
  const testUsers = makeUsersArray();
  const testLogs = makeLogsArray(testUsers);
  const testTags = makeTagsArray(testUsers);
  const testLogTags = makeLog_Tags();
  return { testLogs, testUsers, testTags, testLogTags };
}

function makeExpectedTestData() {
  const expectedUsers = makeExpectedUsersArray();
  const expectedLogs = makeExpectedLogsArray(expectedUsers);
  const expectedTags = makeExpectedTagsArray(expectedUsers);
  return { expectedLogs, expectedUsers, expectedTags };
}

function seedUsers(db, users) {
  const preppedUsers = users.map((user) => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1),
  }));
  return db
    .into("users")
    .insert(preppedUsers)
    .then(() => {
      return db.raw(`SELECT setval('users_id_seq',?)`, [
        users[users.length - 1].id,
      ]);
    });
}

function seedLogsTables(db, users, logs, tags = []) {
  return db.transaction(async (trx) => {
    await seedUsers(trx, users);
    await trx.into("logs").insert(logs);
    await trx.into("tags").insert(tags);
    if (tags.length > 0) {
      const logTags = makeLog_Tags();
      await trx.into("log_tags").insert(logTags);
    }
    await trx.raw(`SELECT setval('logs_id_seq', ?)`, [
      logs[logs.length - 1].id,
    ]);
  });
}

function seedMaliciousLog(db, user, log) {
  return seedUsers(db, [user]).then(() => {
    return db.into("logs").insert([log]);
  });
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.user_name,
    algorithm: "HS256",
  });
  return `Bearer ${token}`;
}

module.exports = {
  cleanTables,
  makeKnexInstance,
  makeAuthHeader,

  makeLogsArray,
  makeTagsArray,
  makeUsersArray,
  makeLog_Tags,
  makeTestData,

  makeMaliciousLog,

  makeExpectedLogsArray,
  makeExpectedUsersArray,
  makeExpectedTagsArray,
  makeExpectedTestData,

  seedLogsTables,
  seedUsers,
  seedMaliciousLog,
};
