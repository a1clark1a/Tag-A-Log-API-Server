const LogsService = {
  //CREATE
  insertLogs(knex, newLogs) {
    return knex
      .insert(newLogs)
      .into("logs")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },

  //READ
  getAllLogs(knex) {
    return knex.from("logs").select("*").orderBy("date_created", "desc");
  },

  getAllLogsByUserId(knex, usersId) {
    return knex.from("logs").select("*").where("user_id", usersId);
  },

  getLogsById(knex, logsId, usersId) {
    return knex
      .from("logs")
      .select("*")
      .where({ id: logsId, user_id: usersId })
      .first();
  },

  getTagsByLogsId(knex, logsId, usersId) {
    return knex
      .from("tags AS tag")
      .select("*")
      .leftJoin("log_tags AS lt", "tag.id", "lt.tag_id")
      .where({ log_id: logsId, "tag.user_id": usersId });
  },

  //UPDATE
  updateLogs(knex, logsId, logsToUpdate) {
    return knex.from("logs").where("id", logsId).update(logsToUpdate);
  },

  //DELETE
  deleteLogs(knex, logsId, usersId) {
    return knex("logs")
      .where({ id: logsId, user_id: usersId })
      .first()
      .delete();
  },
};

module.exports = LogsService;
