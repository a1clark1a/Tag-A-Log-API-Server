const express = require("express");
const path = require("path");
const logger = require("../middleware/logger");
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
        res.json(tags.map(TagsService.sanitizeTags));
      })
      .catch(next);
  })
  //POST a tag
  .post(/*requireAuth, */ jsonBodyParser, (req, res, next) => {
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

    TagsService.insertTag(knexInstance, newTag)
      .then((tag) => {
        if (!tag) {
          logger.error(`Tag was not inserted into database`);
        }
        logger.info(`Tag succesffuly uploaded by user_id ${tag.user_id}`);
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${tag.id}`))
          .json(TagsService.sanitizeTags(tag));
      })
      .catch(next);
  });

//GET
tagsRouter
  .route("/:tags_id")
  //TODO .all(requireAuth) require auth here
  .all((req, res, next) => {});

module.exports = tagsRouter;
