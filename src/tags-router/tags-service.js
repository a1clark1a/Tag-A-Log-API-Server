const xss = require("xss");

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

  //READ
  getAllTags(knex) {
    return knex.from("tags").select("*").orderBy("date_created", "desc");
  },

  getTagsByTagName(knex, tagsName) {
    return knex.from("tags").select("*").where({ tag_name: tagsName }).first();
  },

  //TODO GET LOGS ASSOCIATED BY TAGS

  //UPDATE
  updateTag(knex, tagsId, tagsToUpdate) {
    return knex.from("tags").where("id", tagsId).update(tagsToUpdate);
  },

  //DELETE
  deleteTag(knex, tagsId, usersId) {
    return knex
      .from("tags")
      .where({ id: tagsId, user_id: usersId })
      .first()
      .delete();
  },

  //SANITIZE
  sanitizeTags(tags) {
    return {
      id: tags.id,
      tag_name: xss(tags.tag_name),
      user_id: tags.user_id,
      date_created: new Date(tags.date_created).toLocaleString(),
    };
  },
};

module.exports = TagsService;
