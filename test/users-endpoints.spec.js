const app = require("../src/app");
const helpers = require("./test-helpers");
const logger = require("../src/middleware/logger");

describe("Users Endpoints", function () {
  let db;
  const { testUsers, testLogs, testTags } = helpers.makeTestData();
  const { expectedLogs } = helpers.makeExpectedTestData();
  const validUser = testUsers[0];

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

  //TESTING get user info
  describe(`GET /api/users/`, () => {
    context("User is logged in", () => {
      beforeEach("insert users", () => {
        return helpers.seedUsers(db, testUsers);
      });

      it(`responds with 200 and the user`, () => {
        return supertest(app)
          .get(`/api/users`)
          .set("Authorization", helpers.makeAuthHeader(validUser))
          .expect(200)
          .expect((res) => {
            expect(res.body).to.have.property("id");
            expect(res.body).to.have.property("date_created");
            expect(res.body.user_name).to.eql(validUser.user_name);
            expect(res.body.email).to.eql(validUser.email);
          });
      });
    });
  });

  //TESTING REGISTRATION VALIDATION AND CREATION
  describe(`POST /api/users`, () => {
    //MISSING FIELD IN REQUEST BODY WHEN REGISTERING TEST
    context("User validation", () => {
      const requiredFields = ["user_name", "password", "email"];

      requiredFields.forEach((field) => {
        const registerAttemptBody = {
          user_name: "test-user_name",
          password: "Test-pass123!",
          email: "test123@gmail.com",
        };

        it(`responds with 400 error when '${field}' is missing`, () => {
          delete registerAttemptBody[field];

          return supertest(app)
            .post("/api/users")
            .send(registerAttemptBody)
            .set("Accept", "application/json")
            .expect(400, {
              error: { message: `Missing '${field}' in request body` },
            });
        });
      });
    });

    context("User creation", () => {
      const newUser = {
        user_name: "test-user_name",
        password: "Test-pass123!",
        email: "test123@gmail.com",
      };

      it(`responds with 201 and creates a new user`, () => {
        return supertest(app)
          .post("/api/users")
          .send(newUser)
          .set("Accept", "application/json")
          .expect(201)
          .expect((res) => {
            expect(res.body).to.have.property("id");
            expect(res.body).to.have.property("date_created");
            expect(res.body.user_name).to.eql(newUser.user_name);
            expect(res.body.email).to.eql(newUser.email);
          });
      });
    });
  });
});
