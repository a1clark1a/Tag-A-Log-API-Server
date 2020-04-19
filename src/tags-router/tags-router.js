const express = require("express");
const path = require("path");
const logger = require("../middleware/logger");
const { requireAuth } = require("../middleware/jwt-auth");
const { sanitizeTags, sanitizeLogs } = require("../middleware/serviceHelper");
const TagsService = require("./tags-service");

const tagsRouter = express.Router();
const jsonBodyParser = express.json();

//GET ALL tags
tagsRouter
  .route("/")
  .all(requireAuth)
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    const user_id = req.user.id;
    TagsService.getAllTagsByUserId(knexInstance, user_id)
      .then((tags) => {
        logger.info("all tags requested");
        res.json(tags.map(sanitizeTags));
      })
      .catch(next);
  })
  //POST a tag
  .post(jsonBodyParser, (req, res, next) => {
    const { tag_name, log_id } = req.body;
    const user_id = req.user.id;
    const newTag = { tag_name, user_id };
    const knexInstance = req.app.get("db");

    for (const [key, value] of Object.entries(newTag)) {
      if (value == null || value == "") {
        logger.error(`Posting tag Missing ${key} in request body`);
        return res.status(400).json({
          error: {
            message: `Uploading a tag requires tag name and must be signed in`,
          },
        });
      }
    }

    if (!log_id) {
      logger.error(`Posting tag Missing log_id in request body`);
      return res.status(400).json({
        error: {
          message: `Uploading a tag requires it to be associated with a log`,
        },
      });
    }

    //TAG_NAME MUST be UNIQUE PER USER_ID
    TagsService.hasDuplicateTagForUser(knexInstance, tag_name, user_id)
      .then((hasDuplicate) => {
        if (hasDuplicate) {
          logger.error(
            `posting a tag with this ${tag_name} user_name that already exist for user ${user_id}`
          );
          return res.status(400).json({
            error: { message: `Tag name already exists` },
          });
        }

        TagsService.insertTag(knexInstance, newTag).then((tag) => {
          if (!tag) {
            logger.error(`Tag was not inserted into database`);
          }
          logger.info(`Tag succesffuly uploaded by user_id ${tag.user_id}`);
          const logTag = { log_id, tag_id: tag.id };
          TagsService.insertRelationLogTag(knexInstance, logTag).then(
            (logTag) => {
              if (!logTag) {
                logger.error(
                  `could not create relation between log_id and tag_id`
                );
                return res.status(400).json({
                  error: {
                    message: `Could not create log and tag relationship`,
                  },
                });
              }
            }
          );
          res
            .status(201)
            .location(path.posix.join(req.originalUrl, `/${tag.id}`))
            .json(sanitizeTags(tag));
        });
      })
      .catch(next);
  });

//GET a single tag
tagsRouter
  .route("/:tags_id")
  .all(requireAuth)
  .all(jsonBodyParser, (req, res, next) => {
    const knexInstance = req.app.get("db");
    const { tags_id } = req.params;
    const user_id = req.user.id;

    TagsService.getTagByTagsId(knexInstance, tags_id, user_id)
      .then((tag) => {
        if (!tag) {
          logger.error(
            "Tag does not exist when after calling getTagsByTagName"
          );
          return res.status(404).json({
            error: { message: `Tag does not exist` },
          });
        }
        res.tag = tag;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(sanitizeTags(res.tag));
  })
  //UPDATE tag
  .patch(jsonBodyParser, (req, res, next) => {
    const knexInstance = req.app.get("db");
    const { tag_name, log_id } = req.body;
    const { tags_id } = req.params;
    const user_id = req.user.id;
    const updatedTag = { tag_name, user_id };

    for (const [key, value] of Object.entries(updatedTag)) {
      if (value == null || value == "") {
        logger.error(`Updating tag Missing ${key} in request body`);
        return res.status(400).json({
          error: {
            message: `Updating a tag requires tag name and must be signed in`,
          },
        });
      }
    }

    if (!log_id) {
      logger.error(`Posting tag Missing log_id in request body`);
      return res.status(400).json({
        error: {
          message: `Uploading a tag requires it to be associated with a log`,
        },
      });
    }

    //TAG_NAME MUST be UNIQUE PER USER_ID
    TagsService.hasDuplicateTagForUser(knexInstance, tag_name, user_id)
      .then((hasDuplicate) => {
        if (hasDuplicate) {
          logger.error(
            `error: posting a tag with this ${tag_name} user_name that already exist for user ${user_id}`
          );
          return res.status(400).json({
            error: { message: `Tag name already exists` },
          });
        }

        TagsService.updateTag(knexInstance, tags_id, updatedTag).then(
          (updatedRows) => {
            if (!updatedRows) {
              logger.error("Tag was not updated");
              return res.status(400).json({
                error: { message: "Unable to update" },
              });
            }
            logger.info(`Tag succesfully updated with tag_name of ${tag_name}`);
            res.status(204).end();
          }
        );
      })
      .catch(next);
  })
  //DELETE a tag
  .delete(jsonBodyParser, (req, res, next) => {
    const knexInstance = req.app.get("db");
    const user_id = req.user.id;
    const { tags_id } = req.params;

    TagsService.deleteTag(knexInstance, tags_id, user_id)
      .then(() => {
        logger.info(
          `Tag Succesfully deleted with tag id ${tags_id} uploaded by user with id ${user_id}`
        );
        res.status(204).end();
      })
      .catch(next);
  });

//GET a tags list of logs
tagsRouter
  .route("/:tags_id/logs")
  .all(requireAuth)
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    const { tags_id } = req.params;
    const user_id = req.user.id;

    TagsService.getTagByTagsId(knexInstance, tags_id, user_id).then((tag) => {
      if (!tag) {
        logger.error("Tag does not exist when after calling getTagsByTagName");
        return res.status(404).json({
          error: { message: `Tag does not exist` },
        });
      }
    });

    TagsService.getLogsByTagsId(knexInstance, tags_id, user_id)
      .then((logs) => {
        console.log(logs);
        if (!logs) {
          logger.error("Logs does not exist after calling getLogsByTagsId");
          return res.status(400).json({
            error: { message: `Logs does not exist` },
          });
        }
        res.json(logs.map(sanitizeLogs));
      })
      .catch(next);
  });
module.exports = tagsRouter;
