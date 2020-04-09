const express = require("express");
const path = require("path");
const logger = require("../middleware/logger");

const UsersService = require("./users-service");

const usersRouter = express.Router();
const jsonBodyParser = express.json();

usersRouter
  .route("/:user_name") //TODO need require authentication
  .all((req, res, next) => {
    const knexInstance = req.app.get("db");
    const { user_name } = req.params;
  });
