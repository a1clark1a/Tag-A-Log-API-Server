const jwt = require("jsonwebtoken");
const app = require("../src/app");
const helpers = require("./test-helpers");
const logger = require("../src/middleware/logger");

describe("Auth Endpoints", function () {
  let db;
  const { testUsers } = helpers.makeTestData();
  const validUser = testUsers[0];

  before("make knex instace", () => {
    db = helpers.makeKnexInstance();
    if (!db) {
      logger.error(`Knex instance not created`);
    }
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("clean the tables", () => helpers.cleanTables(db));

  afterEach("clean the tables", () => helpers.cleanTables(db));

  //TESTING LOG IN
  describe(`POST /api/auth/login`, () => {
    beforeEach(`insert users`, () => {
      return helpers.seedUsers(db, testUsers);
    });

    const requiredField = ["user_name", "password"];

    //MISSING FIELD IN REQUEST BODY TEST
    requiredField.forEach((field) => {
      const loginAttemptBody = {
        user_name: validUser.user_name,
        password: validUser.password,
      };

      it(`responds with 400 required error when '${field}' is missing`, () => {
        delete loginAttemptBody[field];

        return supertest(app)
          .post("/api/auth/login")
          .send(loginAttemptBody)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` },
          });
      });
    });

    //INCORRECT user_name and password TEST
    it(`responds 400 invalid user_name or password when wrong user_name`, () => {
      const userInvalidUser = {
        user_name: "does-not-exist",
        password: "pass-word",
      };

      return supertest(app)
        .post("/api/auth/login")
        .send(userInvalidUser)
        .expect(400, {
          error: { message: `Incorrect User name or password` },
        });
    });

    it(`responds with 400 invalid user_name or password when wrong password`, () => {
      const userInvalidPass = {
        user_name: validUser.user_name,
        password: "wrong-pass",
      };

      return supertest(app)
        .post("/api/auth/login")
        .send(userInvalidPass)
        .expect(400, {
          error: { message: `Incorrect User name or password` },
        });
    });

    //CORRECT RESPONSE TEST
    it(`responds 200 and JWT authToken using secret JWT when valid credentials`, () => {
      const userValidCreds = {
        user_name: validUser.user_name,
        password: validUser.password,
      };

      const expectedToken = jwt.sign(
        { user_id: validUser.id },
        process.env.JWT_SECRET,
        {
          subject: validUser.user_name,
          algorithm: "HS256",
        }
      );
      return supertest(app)
        .post("/api/auth/login")
        .send(userValidCreds)
        .expect(200, {
          authToken: expectedToken,
          user_name: validUser.user_name,
        });
    });
  });
});
