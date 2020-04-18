const app = require("../src/app");
const helpers = require("./test-helpers");
const logger = require("../src/middleware/logger");

describe("Logs Endpoints", () => {
  let db;
  const { testLogs, testUsers } = helpers.makeTestData();
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
      beforeEach("insert users", () => {
        return helpers.seedUsers(db, testUsers);
      });

      it(`responds with 200 and an empty list`, () => {
        const validUser = testUsers[0];

        return supertest(app)
          .get("/api/logs")
          .set("Authorization", helpers.makeAuthHeader(validUser))
          .expect(200, []);
      });
    });

    context(`Given there are logs in the database`, () => {
      beforeEach("insert logs", () => {
        return helpers.seedLogsTables(db, testUsers, testLogs);
      });

      it(`responds with 200 and a list of logs`, () => {
        const validUser = testUsers[0];

        return supertest(app)
          .get("/api/logs")
          .set("Authorization", helpers.makeAuthHeader(validUser))
          .expect(200, expectedLogs);
      });
    });

    context(`Given an XSS attack log`, () => {
      const validUser = testUsers[0];
      const { maliciousLog, expectedLogForMalic } = helpers.makeMaliciousLog(
        validUser
      );
      beforeEach("insert malicious data", () => {
        return helpers.seedMaliciousLog(db, validUser, maliciousLog);
      });

      it("removes XSS attack scripts", () => {
        return supertest(app)
          .get("/api/logs")
          .set("Authorization", helpers.makeAuthHeader(validUser))
          .expect(200)
          .expect((res) => {
            expect(res.body[0].log_name).to.eql(expectedLogForMalic.log_name);
            expect(res.body[0].description).to.eql(
              expectedLogForMalic.description
            );
          });
      });
    });
  });

  //TESTING FOR A SPECIFIC LOG
  describe(`GET /api/logs/:logs_id`, () => {
    context(`Given no logs`, () => {
      beforeEach("insert users", () => {
        return helpers.seedUsers(db, testUsers);
      });

      it(`responds with 404`, () => {
        const validUser = testUsers[0];
        const nonExistingId = 1234;
        return supertest(app)
          .get(`/api/logs/${nonExistingId}`)
          .set("Authorization", helpers.makeAuthHeader(validUser))
          .expect(404, {
            error: { message: `Log does not exist` },
          });
      });
    });

    context(`Given there are logs in the database`, () => {
      beforeEach("insert logs", () => {
        return helpers.seedLogsTables(db, testUsers, testLogs);
      });

      it(`responds with 200 and the specified log`, () => {
        const validUser = testUsers[0];
        const logId = 1;
        const expectedLog = expectedLogs[logId - 1];

        return supertest(app)
          .get(`/api/logs/${logId}`)
          .set("Authorization", helpers.makeAuthHeader(validUser))
          .expect(200, expectedLog);
      });
    });
  });

  //TESTING FOR UPLOADING A LOG
  describe(`POST /api/logs`, () => {
    context(`Given incomplete field`, () => {
      beforeEach("insert users", () => {
        return helpers.seedUsers(db, testUsers);
      });
      const validUser = testUsers[0];
      const requiredField = ["log_name", "description", "user_id"];

      requiredField.forEach((field) => {
        uploadAttemptBody = {
          log_name: "upload-test",
          description: "description test",
          user_id: validUser.id,
          url: "https://acperfecto.now.sh",
        };

        it(`responds with 400 required error when '${field} is missing`, () => {
          delete uploadAttemptBody[field];

          return supertest(app)
            .post("/api/logs")
            .set("Authorization", helpers.makeAuthHeader(validUser))
            .send(uploadAttemptBody)
            .expect(400, {
              error: {
                message: `Uploading a log requires log name and description and must be signed in`,
              },
            });
        });
      });
    });

    context(`Uploading with complete field`, () => {
      beforeEach("insert user", () => {
        return helpers.seedUsers(db, testUsers);
      });
      const validUser = testUsers[0];
      const uploadBody = {
        log_name: "upload-test",
        description: "description test",
        user_id: validUser.id,
        url: "https://acperfecto.now.sh",
        num_tags: 1,
      };

      it(`responds with 200 and the uploaded log with correct credentials`, () => {
        return supertest(app)
          .post("/api/logs")
          .set("Authorization", helpers.makeAuthHeader(validUser))
          .send(uploadBody)
          .expect(201)
          .expect((res) => {
            expect(res.body).to.have.property("id");
            expect(res.body).to.have.property("user_id");
            expect(res.body.log_name).to.eql(uploadBody.log_name);
            expect(res.body.description).to.eql(uploadBody.description);
            expect(res.body.url).to.eql(uploadBody.url);
            expect(res.body.user_id).to.eql(uploadBody.user_id);
            expect(res.body.num_tags).to.eql(uploadBody.num_tags || 0);
          });
      });
    });
  });
});
