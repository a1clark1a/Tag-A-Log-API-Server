//TODO LOGS SERVICE
const LogsService = {
  getAllLogs(knex) {
    return knex.from("logs").select("*").orderBy("date_created", "desc");
  },

  getLogsById(knex, logsId) {
    return knex.from("logs").select("*").where("id", logsId).first();
  },
};

module.exports = LogsService;
