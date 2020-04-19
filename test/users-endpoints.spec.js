const app = require("../src/app");
const helpers = require("./test-helpers");
const logger = require("../src/middleware/logger");

describe("Users Endpoints", function () {
  let db;
  //const { testUsers } //TODO make helpers.testData call here
  //  const testUser = testUsers[0]

  before("make knex instance", () => {
    db = helpers.makeKnexInstance();
    if (!db) {
      logger.error(`Knex instance not created`);
    }
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("clean the tables", () => helpers.cleanTables(db));

  beforeEach("clean the tables", () => helpers.cleanTables(db));

  //TODO GET user_name test
  describe(`GET /api/users/:user_name`, () => {});

  //TODO GET user created logs test
  describe(`GET /api/users/:user_id/logs`, () => {});

  //REGISTRATION TEST
  describe(`POST /api/users`, () => {
    context("User validation", () => {
      beforeEach("insert users", () => {
        return; //TODO seedUsers call here
      });

      const requiredFields = ["user_name", "password", "email"];

      //MISSING FIELD IN REQUEST BODY WHEN REGISTERING TEST
      requiredFields.forEach((field) => {
        const registerAttemptBody = {
          user_name: "test-user_name",
          password: "test-pass123!",
          email: "test123@gmail.com",
        };

        it(`responds with 400 error when '${field}' is missing`, () => {
          delete requiredFields[field];

          return supertest(app)
            .post("/api/users")
            .send(registerAttemptBody)
            .expect(400);
        });
      });
    });

    //TODO create test user and test
    context("User creation", () => {});
  });
});
