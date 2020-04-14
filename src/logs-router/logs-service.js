const xss = require("xss");

const LogsService = {
  getAllLogs(knex) {
    return knex.from("logs").select("*").orderBy("date_created", "desc");
  },

  getAllLogsByUserId(knex, userId) {
    return knex
      .from("logs")
      .select("*")
      .where("user_id", userId)
      .orderBy("date_created", "desc");
  },

  getLogsById(knex, logsId) {
    return knex.from("logs").select("*").where("id", logsId).first();
  },

  insertLogs(knex, newLogs) {
    return knex
      .insert(newLogs)
      .into("logs")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },

  updateLogs(knex, logs_id, logsToUpdate) {
    return knex.from("logs").where("id", logs_id).update(logsToUpdate);
  },

  deleteLogs(knex, logs_id, user_id) {
    return knex("logs")
      .where({ id: logs_id, user_id: user_id })
      .first()
      .delete();
  },

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
