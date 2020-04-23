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

      const validUser = testUsers[0];
      const usersLogs = [];

      expectedLogs.forEach((log) => {
        if (log.user_id === validUser.id) {
          usersLogs.push(log);
        }
      });

      it(`responds with 200 and a list of logs`, () => {
        return supertest(app)
          .get("/api/logs")
          .set("Authorization", helpers.makeAuthHeader(validUser))
          .expect(200, usersLogs);
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

      const methods = [
        {
          method: supertest(app).get,
        },
        {
          method: supertest(app).post,
        },
        {
          method: supertest(app).patch,
        },
        {
          method: supertest(app).delete,
        },
      ];

      const validUser = testUsers[0];
      const nonExistingId = 1;

      methods.forEach((request) => {
        it(`responds with 404`, () => {
          return request
            .method(`/api/logs/${nonExistingId}`)
            .set("Authorization", helpers.makeAuthHeader(validUser))
            .expect(404, {
              error: { message: `Log does not exist` },
            });
        });
      });
    });

    context(`Given there are logs in the database`, () => {
      beforeEach("insert logs", () => {
        return helpers.seedLogsTables(db, testUsers, testLogs);
      });

      const validUser = testUsers[0];
      const logId = 1;
      const expectedLog = expectedLogs[logId - 1];

      it(`responds with 200 and the specified log`, () => {
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

      it(`responds with 201 and the uploaded log`, () => {
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

  //TESTING FOR EDITING A LOG
  describe(`PATCH /api/logs/:logs_id`, () => {
    context(`Given no values`, () => {
      beforeEach("insert logs", () => {
        return helpers.seedLogsTables(db, testUsers, testLogs);
      });

      const validUser = testUsers[0];
      const logsId = testLogs[0].id;

      it(`responds with 400 required error when request body is empty`, () => {
        const emptyLog = {};
        return supertest(app)
          .patch(`/api/logs/${logsId}`)
          .set("Authorization", helpers.makeAuthHeader(validUser))
          .send(emptyLog)
          .expect(400, {
            error: { message: `Request body must not be empty` },
          });
      });
    });

    context(`Given there are logs in the database`, () => {
      beforeEach("insert logs", () => {
        return helpers.seedLogsTables(db, testUsers, testLogs);
      });

      const validUser = testUsers[0];
      const logsId = testLogs[0].id;

      const updatedLog = {
        id: logsId,
        user_id: validUser.id,
        log_name: "new name for log",
        description: "new description",
        num_tags: 2,
        url: "https://acperfecto.now.sh",
      };

      it(`responds with 204 and updated log`, () => {
        return supertest(app)
          .patch(`/api/logs/${logsId}`)
          .set("Authorization", helpers.makeAuthHeader(validUser))
          .send(updatedLog)
          .expect(204);
      });
    });
  });

  //TESTING DELETING A LOG
  describe(`DELETE /api/logs/:logs_id`, () => {
    context(`Given there are logs in the database`, () => {
      beforeEach("insert logs", () => {
        return helpers.seedLogsTables(db, testUsers, testLogs);
      });

      const validUser = testUsers[0];
      const logsId = testLogs[0].id;

      it(`responds with a 204 and deletes the log`, () => {
        return supertest(app)
          .delete(`/api/logs/${logsId}`)
          .set("Authorization", helpers.makeAuthHeader(validUser))
          .expect(204);
      });
    });
  });

  //TESTING GETTING TAGS ATTACHED TO LOG
  describe(`GET /api/logs/:logs_id/tags`, () => {
    context(`Given there are logs in the database but no tags`, () => {
      beforeEach("insert logs", () => {
        return helpers.seedLogsTables(db, testUsers, testLogs);
      });

      const validUser = testUsers[0];
      const logWithNoTag = 8;

      it(`responds with a 404`, () => {
        return supertest(app)
          .get(`/api/logs/${logWithNoTag}/tags`)
          .set("Authorization", helpers.makeAuthHeader(validUser))
          .expect(200, []);
      });
    });

    context(`Given there are logs and tags in the database`, () => {
      const testTags = helpers.makeTagsArray(testUsers);
      beforeEach("insert logs and tags", () => {
        return helpers.seedLogsTables(db, testUsers, testLogs, testTags);
      });

      const validUser = testUsers[0];
      const logsId = 4;

      it(`responds with a 200 and a list of tags of the log ${logsId}`, () => {
        return supertest(app)
          .get(`/api/logs/${logsId}/tags`)
          .set("Authorization", helpers.makeAuthHeader(validUser))
          .expect(200)
          .expect((res) => {
            expect(res.body[0]).to.have.property("log_tags");
            expect(res.body[0].log_tags.log_id).to.eql(logsId);
            expect(res.body[0].user_id).to.eql(validUser.id);
          });
      });
    });
  });
});
