const express = require("express");
const path = require("path");

const logger = require("../middleware/logger");

const LogsService = require("./logs-service");

const logsRouter = express.Router();
const jsonBodyParser = express.json();

logsRouter.route("/").get((req, res, next) => {
  const knexInstance = req.app.get("db");
  LogsService.getAllLogs(knexInstance)
    .then((logs) => {
      logger.info(`all logs requested`);
      res.json(logs);
    })
    .catch(next);
});

logsRouter
  .route("/:logsId")
  .all((req, res, next) => {
    const knexInstance = req.app.get("db");
    const { logsId } = req.params;
    LogsService.getLogsById(knexInstance, logsId)
      .then((log) => {
        if (!log) {
          logger.error("log does not exist when after calling getLogsById");
          return res.status(404).json({
            error: { message: `Log does not exist` },
          });
        }
        res.log = log;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(res.log);
  });

module.exports = logsRouter;
