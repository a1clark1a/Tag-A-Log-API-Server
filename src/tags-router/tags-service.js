const TagsService = {
  //CREATE
  insertTag(knex, newTag) {
    return knex
      .insert(newTag)
      .into("tags")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },

  insertRelationLogTag(knex, logTag) {
    return knex
      .insert(logTag)
      .into("log_tags")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },

  //READ
  getAllTags(knex) {
    return knex.from("tags").select("*").orderBy("date_created", "desc");
  },

  getAllTagsByUserId(knex, usersId) {
    return knex.from("tags").select("*").where("user_id", usersId);
  },

  getTagByTagsId(knex, tagsId, usersId) {
    return knex
      .from("tags")
      .select("*")
      .where({ id: tagsId, user_id: usersId })
      .first();
  },

  getLogsByTagsId(knex, tagsId, usersId) {
    return knex
      .from("logs AS log")
      .select("*")
      .leftJoin("log_tags AS lt", "log.id", "lt.log_id")
      .where({ tag_id: tagsId, user_id: usersId });
  },

  getLogTagsRelation(knex, logsId, tagsId) {
    return knex
      .from("log_tags")
      .select("*")
      .where({ log_id: logsId, tag_id: tagsId })
      .first();
  },

  //UPDATE
  updateTag(knex, tagsId, tagsToUpdate) {
    return knex.from("tags").where({ id: tagsId }).update(tagsToUpdate);
  },

  //DELETE
  deleteTag(knex, tagsId, usersId) {
    return knex
      .from("tags")
      .where({ id: tagsId, user_id: usersId })
      .first()
      .delete();
  },

  //HELPERS
  hasDuplicateTagForUser(knex, tagsName, usersId) {
    return knex
      .from("tags")
      .where({ tag_name: tagsName, user_id: usersId })
      .first()
      .then((tag) => !!tag);
  },
};

module.exports = TagsService;
