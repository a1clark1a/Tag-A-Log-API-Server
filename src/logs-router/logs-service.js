const xss = require("xss");

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
    return knex
      .from("logs")
      .select("*")
      .where("user_id", usersId)
      .orderBy("date_created", "desc");
  },

  getLogsById(knex, logsId) {
    return knex.from("logs").select("*").where("id", logsId).first();
  },

  //TODO GET TAGS ASSOCIATED BY LOG

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

  //SANITIZE
  sanitizeLogs(logs) {
    return {
      id: logs.id,
      log_name: xss(logs.log_name),
      description: xss(logs.description),
      url: logs.url,
      num_tags: Number(logs.num_tags) || 0,
      date_created: new Date(logs.date_created).toLocaleString(),
      user_id: logs.user_id,
    };
  },
};

module.exports = LogsService;
