const express = require("express");
const path = require("path");

const logger = require("../middleware/logger");

const LogsService = require("./logs-service");

const logsRouter = express.Router();
const jsonBodyParser = express.json();

logsRouter.route("/").get((req, res, next) => {
  res.send("This will get you all the logs");
});

logsRouter.route("/:logsId").all((req, res, next) => {
  const { logsId } = req.params;
  res.send(`Successfuly called logs with id of ${logsId}`);
});

module.exports = logsRouter;
