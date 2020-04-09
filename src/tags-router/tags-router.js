const express = require("express");
const path = require("path");
const logger = require("../middleware/logger");
const TagsService = require("./tags-service");

const tagsRouter = express.Router();
const jsonBodyParser = express.json();

tagsRouter.route("/").get((req, res, next) => {
  //TODO would need to require authentication
  const knextInstance = req.app.get("db");
  TagsService.getAllTags(knextInstance)
    .then((tags) => {
      logger.info("all tags requested");
      res.json(tags);
    })
    .catch(next);
});

module.exports = tagsRouter;
