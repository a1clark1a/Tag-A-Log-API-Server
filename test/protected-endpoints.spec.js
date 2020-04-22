const app = require("../src/app");
const helpers = require("./test-helpers");
const logger = require("../src/middleware/logger");

describe(`Protected Endpoints`, () => {
  let db;
  const { testUsers, testLogs, testTags } = helpers.makeTestData();
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

  afterEach("clean the tables", () => helpers.cleanTables(db));

  beforeEach("insert test data", () => {
    return helpers.seedLogsTables(db, testUsers, testLogs, testTags);
  });

  //TESTING FOR `USER MUST BE LOGGED IN REQUIRED`REQUESTS

  const protectedEndpoints = [
    //USER
    {
      name: "GET /api/users",
      path: `/api/users/`,
      method: supertest(app).get,
    },
    //LOGS
    {
      name: "Post /api/logs",
      path: `/api/logs/`,
      method: supertest(app).post,
    },
    {
      name: "GET /api/logs",
      path: `/api/logs/`,
      method: supertest(app).get,
    },
    {
      name: "GET /api/logs/:logs_id",
      path: `/api/logs/${validUser.id}`,
      method: supertest(app).get,
    },
    {
      name: "PATCH /api/logs/:logs_id",
      path: `/api/logs/${validUser.id}`,
      method: supertest(app).patch,
    },
    {
      name: "DELETE /api/logs/:logs_id",
      path: `/api/logs/${validUser.id}`,
      method: supertest(app).delete,
    },
    {
      name: "GET /api/logs/:logs_id/tags",
      path: `/api/logs/${validUser.id}/tags`,
      method: supertest(app).get,
    },
    //TAGS
    {
      name: "POST /api/tags",
      path: `/api/tags/`,
      method: supertest(app).post,
    },
    {
      name: "GET /api/tags",
      path: `/api/tags/`,
      method: supertest(app).get,
    },
    {
      name: "GET /api/tags/:tags_id",
      path: `/api/tags/${testTags[0].id}`,
      method: supertest(app).get,
    },
    {
      name: "PATCH /api/tags/:tags_id",
      path: `/api/tags/${testTags[0].id}`,
      method: supertest(app).patch,
    },
    {
      name: "DELETE /api/tags/:tags_id",
      path: `/api/tags/${testTags[0].id}`,
      method: supertest(app).delete,
    },
    {
      name: "GET /api/tags/:tags_id/logs",
      path: `/api/tags/${testTags[0].id}/logs`,
      method: supertest(app).get,
    },
  ];

  protectedEndpoints.forEach((endpoint) => {
    describe(endpoint.name, () => {
      context(`Unauthorized request`, () => {
        it(`responds with 401 'Missing bearer token when no bearer token`, () => {
          return endpoint
            .method(endpoint.path)
            .expect(401, { error: { message: `Missing bearer token` } });
        });

        it(`responds with 401 'Unauthorized request' when invalid JWT secret`, () => {
          const invalidSecret = "Bad-secret";
          return endpoint
            .method(endpoint.path)
            .set(
              "Authorization",
              helpers.makeAuthHeader(validUser, invalidSecret)
            )
            .expect(401, { error: { message: `Unauthorized request` } });
        });

        it(`responds with 401 'Unauthorized request' when invalid sub in payload`, () => {
          const invalidUser = {
            user_name: "not a user",
            id: 10,
          };
          return endpoint
            .method(endpoint.path)
            .set("Authorization", helpers.makeAuthHeader(invalidUser))
            .expect(401, { error: { message: "Unauthorized request" } });
        });
      });
    });
  });
});
