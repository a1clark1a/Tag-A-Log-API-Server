const express = require("express");
const path = require("path");
const logger = require("../middleware/logger");
const { requireAuth } = require("../middleware/jwt-auth");
const { sanitizeTags } = require("../middleware/serviceHelper");
const TagsService = require("./tags-service");

const tagsRouter = express.Router();
const jsonBodyParser = express.json();

//GET ALL tags
tagsRouter
  .route("/")
  .get((req, res, next) => {
    //TODO would need to require authentication
    const knexInstance = req.app.get("db");
    TagsService.getAllTags(knexInstance)
      .then((tags) => {
        logger.info("all tags requested");
        res.json(tags.map(sanitizeTags));
      })
      .catch(next);
  })
  //POST a tag
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    const { tag_name, user_id } = req.body;
    const newTag = { tag_name, user_id };
    const knexInstance = req.app.get("db");

    for (const [key, value] of Object.entries(newTag)) {
      if (value == null) {
        logger.error(`Posting tag Missing ${key} in request body`);
        return res.status(400).json({
          error: {
            message: `Uploading a tag requires tag name and must be signed in`,
          },
        });
      }
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

        TagsService.insertTag(knexInstance, newTag).then((tag) => {
          if (!tag) {
            logger.error(`Tag was not inserted into database`);
          }
          logger.info(`Tag succesffuly uploaded by user_id ${tag.user_id}`);
          res
            .status(201)
            .location(path.posix.join(req.originalUrl, `/${tag.id}`))
            .json(TagsService.sanitizeTags(tag));
        });
      })
      .catch(next);
  });

//GET TAG by tag_name
tagsRouter
  .route("/:tags_id")
  //.all(requireAuth)
  .all(jsonBodyParser, (req, res, next) => {
    const knexInstance = req.app.get("db");
    const { tags_id } = req.params;

    TagsService.getTagByTagsId(knexInstance, tags_id)
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
    const { tag_name, user_id } = req.body;
    const { tags_id } = req.params;
    const updatedTag = { tag_name, user_id };

    for (const [key, value] of Object.entries(updatedTag)) {
      if (value == null) {
        logger.error(`Updating tag Missing ${key} in request body`);
        return res.status(400).json({
          error: {
            message: `Updating a tag requires tag name and must be signed in`,
          },
        });
      }
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
    const { user_id } = req.body;
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

module.exports = tagsRouter;
