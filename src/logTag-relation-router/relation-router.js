const express = require("express");
const path = require("path");
const logger = require("../middleware/logger");
const { requireAuth } = require("../middleware/jwt-auth");
const RelationsService = require("./relation-service");

const relationsRouter = express.Router();
const jsonBodyParser = express.json();

//GET ALL LOG-TAGS relations
relationsRouter
  .route("/")
  .all(requireAuth)
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    RelationsService.getAllLogTagsRelations(knexInstance)
      .then((logTags) => {
        logger.info("all log-tags relations requested");
        res.json(logTags);
      })
      .catch(next);
  })
  //CREATE LOG TAG relations
  .post(jsonBodyParser, (req, res, next) => {
    const knexInstance = req.app.get("db");
    const { log_id, tag_id } = req.body;
    const newLogTag = { log_id, tag_id };

    for (const [key, value] of Object.entries(newLogTag)) {
      if (value == null) {
        logger.error(
          `Posting a log-tag relation is Missing ${key} in request body`
        );
        return res.status(400).json({
          error: {
            message: `Tagging a log requires a log id and tag id and must be signed in`,
          },
        });
      }
    }

    //LOG TAG RELATION MUST BE UNIQUE
    RelationsService.hasDuplicateRelation(knexInstance, log_id, tag_id)
      .then((hasDuplicate) => {
        if (hasDuplicate) {
          logger.error(
            `Relationship between log ${log_id} and tag ${tag_id} already exists`
          );
          return res.status(400).json({
            error: { message: `Relationship already exist` },
          });
        }

        RelationsService.insertRelationLogTag(knexInstance, newLogTag).then(
          (logTag) => {
            if (!logTag) {
              logger.error(`lot tag was not inserted into database`);
            }
            logger.info("Log-Tag relation successfully added");
            res.status(201).end();
          }
        );
      })
      .catch(next);
  });

//GET a single LOG-TAG relations
relationsRouter
  .route("/:logs_id/:tags_id")
  .all(requireAuth)
  .all(jsonBodyParser, (req, res, next) => {
    const knexInstance = req.app.get("db");
    const { logs_id, tags_id } = req.params;

    RelationsService.getLogTagsRelation(knexInstance, logs_id, tags_id)
      .then((logTag) => {
        if (!logTag) {
          logger.error(
            "relationship does not exist after calling getLogTagsRelation"
          );
          return res.status(404).json({
            error: { message: "Relation does not exist" },
          });
        }
        res.logTag = logTag;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(res.logTag);
  })
  //UPDATE LOG-TAG relations
  .patch(jsonBodyParser, (req, res, next) => {
    const knexInstance = req.app.get("db");
    const { log_id, tag_id } = req.body;
    const { logs_id, tags_id } = req.params;
    const updatedLogTag = { log_id, tag_id };

    for (const [key, value] of Object.entries(updatedLogTag)) {
      if (value == null) {
        logger.error(
          `Posting a log-tag relation is Missing ${key} in request body`
        );
        return res.status(400).json({
          error: {
            message: `Tagging a log requires a log id and tag id and must be signed in`,
          },
        });
      }
    }

    //LOG TAG RELATION MUST BE UNIQUE
    RelationsService.hasDuplicateRelation(knexInstance, log_id, tag_id)
      .then((hasDuplicate) => {
        if (hasDuplicate) {
          logger.error(
            `Relationship between log ${log_id} and tag ${tag_id} already exists`
          );
          return res.status(400).json({
            error: { message: `Relationship already exist` },
          });
        }

        RelationsService.updateLogTagsRelations(
          knexInstance,
          logs_id,
          tags_id,
          updatedLogTag
        )
          .then((updateRow) => {
            if (!updateRow) {
              logger.error("Log-tag relation was not updated");
              return res.status(400).json({
                error: { message: "Unable to update" },
              });
            }
            logger.info(`Log-Tag relations updated`);
            res.status(204).end();
          })
          .catch(next);
      })
      .catch(next);
  })
  //DELETE A LOG-TAG relations
  .delete(jsonBodyParser, (req, res, next) => {
    const knexInstance = req.app.get("db");
    const { logs_id, tags_id } = req.params;

    RelationsService.deleteLogTagsRelations(knexInstance, logs_id, tags_id)
      .then(() => {
        logger.info("Log-Tag relation succesffuly deleted");
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = relationsRouter;
