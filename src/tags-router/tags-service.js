const TagsService = {
  getAllTags(knex) {
    return knex.from("tags").select("*").orderBy("date_created", "desc");
  },
};

module.exports = TagsService;
