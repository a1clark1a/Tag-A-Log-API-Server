const app = require("../src/app");
const helpers = require("./test-helpers");
const logger = require("../src/middleware/logger");

describe("Logs Endpoints", () => {
  let db;
  const { testLogs } = helpers.makeTestData();
  const { expectedLogs } = helpers.makeExpectedTestData();

  before("make knex instance", () => {
    db = helpers.makeKnexInstance();
    if (!db) {
      logger.error(`Knex instance not created`);
    }
    app.set("db", db);
  });

  after("disconnect from the db", () => db.destroy());

  before("clean the table", () => helpers.cleanTables(db));

  afterEach("clean the table", () => helpers.cleanTables(db));

  //TESTING FOR LOGS LIST REQUEST
  describe(`GET /api/logs`, () => {
    context(`Given no logs`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app).get("/api/logs").expect(200, []);
      });
    });

    context(`Given there are logs in the database`, () => {
      beforeEach("insert logs", () => {
        return helpers.seedLogsTables(db, testLogs);
      });

      it(`responds with 200 and a list of logs`, () => {
        return supertest(app).get("/api/logs").expect(200, expectedLogs);
      });
    });
  });
});
