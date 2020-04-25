const express = require("express");
const path = require("path");

const logger = require("../middleware/logger");
const { requireAuth } = require("../middleware/jwt-auth");
const { sanitizeLogs, sanitizeTags } = require("../middleware/serviceHelper");
const LogsService = require("./logs-service");

const logsRouter = express.Router();
const jsonBodyParser = express.json();

//GET ALL logs
logsRouter
  .route("/")
  .all(requireAuth)
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    const user_id = req.user.id;
    LogsService.getAllLogsByUserId(knexInstance, user_id)
      .then((logs) => {
        logger.info(`all logs requested`);
        res.json(logs.map(sanitizeLogs));
      })
      .catch(next);
  })
  //POST a log
  .post(jsonBodyParser, (req, res, next) => {
    const { log_name, description, url, num_tags } = req.body;
    const user_id = req.user.id;
    const newLog = { log_name, description, user_id };
    const knexInstance = req.app.get("db");

    for (const [key, value] of Object.entries(newLog)) {
      if (value == null || value == "") {
        logger.error(`Posting log Missing ${key} in request body`);
        return res.status(400).json({
          error: {
            message: `Uploading a log requires log name and description and must be signed in`,
          },
        });
      }
    }
    newLog.url = url;
    newLog.num_tags = num_tags;
    LogsService.insertLogs(knexInstance, newLog)
      .then((log) => {
        if (!log) {
          logger.error("Log was not inserted into database");
        }
        logger.info(`Log succesffuly uploaded by user_id ${log.user_id}`);
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${log.id}`))
          .json(sanitizeLogs(log));
      })
      .catch(next);
  });

//GET LOG by Id
logsRouter
  .route("/:logs_id")
  .all(requireAuth, (req, res, next) => {
    const knexInstance = req.app.get("db");
    const user_id = req.user.id;
    const { logs_id } = req.params;

    LogsService.getLogsById(knexInstance, logs_id, user_id)
      .then((log) => {
        if (!log) {
          logger.error("log does not exist when after calling by logs_id");
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
    res.json(sanitizeLogs(res.log));
  })
  //PATCH update/edit a log
  .patch(jsonBodyParser, (req, res, next) => {
    const knexInstance = req.app.get("db");
    const { log_name, description, url, num_tags } = req.body;
    const user_id = req.user.id;
    const updatedLog = { log_name, description, url };
    const { logs_id } = req.params;

    const numberOfReqBodyVal = Object.values(updatedLog).filter(Boolean).length;
    if (numberOfReqBodyVal === 0) {
      logger.error("Patch request needs at least one field");
      return res.status(400).json({
        error: {
          message: `Request body must not be empty`,
        },
      });
    }

    updatedLog.user_id = user_id;
    updatedLog.num_tags = num_tags;

    LogsService.updateLogs(knexInstance, logs_id, updatedLog)
      .then((updatedRow) => {
        if (!updatedRow) {
          logger.error("Log was not updated");
          return res.status(400).json({
            error: { message: "Unable to update" },
          });
        }
        logger.info(`Log succesfully updated with logs_id of ${logs_id}`);
        res.status(204).end();
      })
      .catch(next);
  })
  //DELETE a log
  .delete(jsonBodyParser, (req, res, next) => {
    const knexInstance = req.app.get("db");
    const user_id = req.user.id;
    const { logs_id } = req.params;
    LogsService.deleteLogs(knexInstance, logs_id, user_id)
      .then(() => {
        logger.info(
          `Log Succesfully deleted with log id ${logs_id} uploaded by user with id ${user_id}`
        );
        res.status(204).end();
      })
      .catch(next);
  });

//GET a logs list of tags
logsRouter
  .route("/:logs_id/tags")
  .all(requireAuth)
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    const { logs_id } = req.params;
    const user_id = req.user.id;

    LogsService.getLogsById(knexInstance, logs_id, user_id)
      .then((log) => {
        if (!log) {
          logger.error("log does not exist when after calling by logs_id");
          return res.status(404).json({
            error: { message: `Log does not exist` },
          });
        }
        LogsService.getTagsByLogsId(knexInstance, logs_id, user_id).then(
          (tags) => {
            res.json(tags.map(sanitizeTags));
          }
        );
      })
      .catch(next);
  });

module.exports = logsRouter;
