const app = require("../src/app");
const helpers = require("./test-helpers");
const logger = require("../src/middleware/logger");

describe(`Tags Endpoints`, function () {
  let db;
  const { testUsers, testLogs, testTags, testLogTags } = helpers.makeTestData();
  const { expectedTags } = helpers.makeExpectedTestData();

  before("make knex instance", () => {
    db = helpers.makeKnexInstance();
    if (!db) {
      logger.error(`Knex instance not created`);
    }
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("clean the tables", () => helpers.cleanTables(db));

  afterEach("clean the tables", () => helpers.cleanTables(db));

  //TESTTING FOR TAGS LIST REQUEST
  describe(`GET /api/tags`, () => {
    context(`Given no tags`, () => {
      beforeEach("insert users", () => {
        return helpers.seedUsers(db, testUsers);
      });

      it(`responds with 200 and an empty list`, () => {
        const validUser = testUsers[0];

        return supertest(app)
          .get("/api/tags")
          .set("Authorization", helpers.makeAuthHeader(validUser))
          .expect(200, []);
      });
    });

    context(`Given there are tags in the database`, () => {
      beforeEach("insert logs and tags", () => {
        return helpers.seedLogsTables(db, testUsers, testLogs, testTags);
      });

      const validUser = testUsers[0];
      const usersTags = [];

      expectedTags.forEach((tag) => {
        if (tag.user_id === validUser.id) {
          usersTags.push(tag);
        }
      });
      it(`responds with 200 and a list of tags`, () => {
        return supertest(app)
          .get("/api/tags")
          .set("Authorization", helpers.makeAuthHeader(validUser))
          .expect(200, usersTags);
      });
    });
  });
  //TODO TEST FOR XSS ATTACK

  //TESTING FOR A SPECIFIC TAG
  describe(`GET /api/tags/:tags_id`, () => {
    context(`Given no tags`, () => {
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
            .method(`/api/tags/${nonExistingId}`)
            .set("Authorization", helpers.makeAuthHeader(validUser))
            .expect(404, {
              error: { message: `Tag does not exist` },
            });
        });
      });
    });

    context(`Given there are tags in the database`, () => {
      beforeEach("insert logs and tags", () => {
        return helpers.seedLogsTables(db, testUsers, testLogs, testTags);
      });

      const validUser = testUsers[0];
      const tagId = 1;
      const expectedTag = expectedTags[tagId - 1];

      it(`responds with 200 and the specified tag`, () => {
        return supertest(app)
          .get(`/api/tags/${tagId}`)
          .set("Authorization", helpers.makeAuthHeader(validUser))
          .expect(200, expectedTag);
      });
    });
  });

  //TESTING FOR UPLOADING and EDITING A TAG
  describe(`POST /api/tags and PATCH /api/tags`, () => {
    const methods = [
      {
        method: supertest(app).post,
      },
      {
        method: supertest(app).patch,
      },
    ];
    context(`Given incomplete field for POST AND PATCH`, () => {
      beforeEach("insert users", () => {
        return helpers.seedUsers(db, testUsers);
      });
      const validUser = testUsers[0];

      const requiredField = ["log_id", "tag_name", "user_id"];

      requiredField.forEach((field) => {
        uploadAttemptBody = {
          log_id: 1,
          tag_name: "test",
          user_id: validUser.id,
        };

        it(`responds with 400 required error when '${field}' is missing`, () => {
          delete uploadAttemptBody[field];
          let error = {
            error: {
              message: `Uploading a tag requires tag name and must be signed in`,
            },
          };
          if (field === "log_id") {
            error = {
              error: {
                message: `Uploading a tag requires it to be associated with a log`,
              },
            };
          }
          methods.forEach((request) => {
            return request
              .method("/api/tags")
              .set("Authorization", helpers.makeAuthHeader(validUser))
              .send(uploadAttemptBody)
              .expect(400, error);
          });
        });
      });
    });

    context(
      `Uploading with a tag name already existing for the same user`,
      () => {
        beforeEach("insert log and tags", () => {
          return helpers.seedLogsTables(db, testUsers, testLogs, testTags);
        });

        const validUser = testUsers[0];
        const uploadBody = {
          tag_name: "react",
          log_id: 1,
          user_id: validUser.id,
        };

        it(`responds with 400 tag already exist error`, () => {
          methods.forEach((request) => {
            return request
              .method("/api/tags")
              .set("Authorization", helpers.makeAuthHeader(validUser))
              .send(uploadBody)
              .expect(400, {
                error: { message: `Tag name already exists` },
              });
          });
        });
      }
    );

    context(`Uploading with a complete field`, () => {
      beforeEach("insert log", () => {
        return helpers.seedLogsTables(db, testUsers, testLogs);
      });

      const validUser = testUsers[0];
      const uploadBody = {
        tag_name: "test",
        log_id: 1,
        user_id: validUser.id,
      };

      it(`responds with 201 and the uploaded tag`, () => {
        methods.forEach((request) => {
          return request
            .method("/api/tags")
            .set("Authorization", helpers.makeAuthHeader(validUser))
            .send(uploadBody)
            .expect(201)
            .expect((res) => {
              expect(res.body).to.have.property("id");
              expect(res.body).to.have.property("user_id");
              expect(res.body).to.have.property("tag_name");
              expect(res.body.tag_name).to.eql(uploadBody.tag_name);
              expect(res.body.user_id).to.eql(uploadBody.user_id);
            });
        });
      });
    });
  });

  //TESTING DELETING A TAG
  describe(`DELETE /api/tags/:tags_id`, () => {
    context(`Given there are tags in the database`, () => {
      beforeEach(`insert logs and tags`, () => {
        return helpers.seedLogsTables(db, testUsers, testLogs, testTags);
      });

      const validUser = testUsers[0];
      const tagsId = testTags[0].id;

      it(`responds with a 204 and deletes the tag`, () => {
        return supertest(app)
          .delete(`/api/logs/${tagsId}`)
          .set("Authorization", helpers.makeAuthHeader(validUser))
          .expect(204);
      });
    });
  });
});
