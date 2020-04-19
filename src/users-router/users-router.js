const express = require("express");
const path = require("path");
const logger = require("../middleware/logger");

const UsersService = require("./users-service");
const LogsService = require("../logs-router/logs-service");
const AuthService = require("../auth/auth-service");
const { requireAuth } = require("../middleware/jwt-auth");
const { sanitizeUser, sanitizeLogs } = require("../middleware/serviceHelper");

const usersRouter = express.Router();
const jsonBodyParser = express.json();

// GET USER info
usersRouter
  .route("/:user_name")
  .all(requireAuth)
  .all((req, res, next) => {
    const knexInstance = req.app.get("db");
    const { user_name } = req.params;

    AuthService.getUserWithUserName(knexInstance, user_name)
      .then((users) => {
        if (!users) {
          logger.error("failed getting user on route /:user_name");
          return res.status(404).json({
            error: { message: `User does not exist` },
          });
        }
        res.users = users;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(sanitizeUser(res.users));
  });

//GET user created logs
usersRouter.route("/:user_id/logs").get((req, res, next) => {
  const knexInstance = req.app.get("db");
  const { user_id } = req.params;

  LogsService.getAllLogsByUserId(knexInstance, user_id)
    .then((logs) => {
      logger.info("logs retrieved using user_id");
      res.json(logs.map(sanitizeLogs));
    })
    .catch(next);
});

// POST USER  - create a new user
usersRouter.post("/", jsonBodyParser, (req, res, next) => {
  const knexInstance = req.app.get("db");
  const { password, user_name, email } = req.body;

  //VALIDATE request body MUST contain all fields
  for (const field of ["user_name", "password", "email"]) {
    if (!req.body[field]) {
      logger.error(`${field} missing`);
      return res.status(400).json({
        error: { message: `Missing '${field}' in request body` },
      });
    }
  }

  //VALIDATE password
  const passwordError = UsersService.validatePassword(password);
  if (passwordError) {
    logger.error(passwordError);
    return res.status(400).json({
      error: { message: passwordError },
    });
  }

  //EMAIL must be unique check
  UsersService.hasUserWithEmail(knexInstance, email).then(
    (hasUserWithEmail) => {
      if (hasUserWithEmail) {
        logger.error(`posting a user with this ${email} email already exists`);
        return res.status(400).json({
          error: { message: `Email already taken` },
        });
      }
    }
  );

  //USER_NAME must be unique check
  UsersService.hasUserWithUserName(knexInstance, user_name)
    .then((hasUserWIthUserName) => {
      if (hasUserWIthUserName) {
        logger.error(
          `posting a user with this ${user_name} user_name that already exist`
        );
        return res.status(400).json({
          error: { message: `Username already taken` },
        });
      }

      //HASH password with bcryptjs
      return UsersService.hashPassword(password).then((hashedPassword) => {
        const newUser = {
          user_name,
          email,
          password: hashedPassword,
          date_created: new Date().toLocaleString("en", { timeZone: "UTC" }),
        };
        //WHEN ALL VALIDATION AND HASHING IS DONE THEN insert user to database
        return UsersService.insertUser(knexInstance, newUser).then((user) => {
          res
            .status(201)
            .location(path.posix.join(req.originalUrl, `/${user.id}`))
            .json(sanitizeUser(user));
        });
      });
    })
    .catch(next);
});

module.exports = usersRouter;
