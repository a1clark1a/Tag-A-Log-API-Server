const RelationsService = {
  //CREATE
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
  getAllLogTagsRelations(knex) {
    return knex.from("log_tags").select("*");
  },

  getLogTagsRelation(knex, logsId, tagsId) {
    return knex
      .from("log_tags")
      .select("*")
      .where({ log_id: logsId, tag_id: tagsId })
      .first();
  },

  //UPDATE
  updateLogTagsRelations(knex, logsId, tagsId, newLogTags) {
    return knex
      .from("log_tags")
      .where({ log_id: logsId, tag_id: tagsId })
      .update(newLogTags);
  },

  //DELETE
  deleteLogTagsRelations(knex, logsId, tagsId) {
    return knex
      .from("log_tags")
      .where({ log_id: logsId, tag_id: tagsId })
      .first()
      .delete();
  },

  //HELPERS
  hasDuplicateRelation(knex, logsId, tagsId) {
    return knex
      .from("log_tags")
      .where({ log_id: logsId, tag_id: tagsId })
      .first()
      .then((logTag) => !!logTag);
  },
};

module.exports = RelationsService;
