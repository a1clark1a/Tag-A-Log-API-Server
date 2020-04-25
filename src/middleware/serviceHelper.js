const xss = require("xss");
const Treeize = require("treeize");

function sanitizeLogs(logs) {
  return {
    id: logs.id,
    log_name: xss(logs.log_name),
    description: xss(logs.description),
    url: logs.url,
    num_tags: Number(logs.num_tags) || 0,
    date_created: new Date(logs.date_created).toLocaleString(),
    user_id: logs.user_id,
  };
}

function sanitizeTags(tags) {
  const tagsTree = new Treeize();
  const tagsData = tagsTree.grow([tags]).getData()[0];

  return {
    id: tags.id,
    tag_name: xss(tags.tag_name),
    user_id: tags.user_id,
    date_created: new Date(tags.date_created).toLocaleString(),
    log_tags:
      {
        log_id: tagsData.log_id,
      } || {},
  };
}

function sanitizeUser(user) {
  return {
    id: user.id,
    user_name: xss(user.user_name),
    email: xss(user.email),
    date_created: new Date(user.date_created).toLocaleString(),
  };
}

module.exports = {
  sanitizeLogs,
  sanitizeTags,
  sanitizeUser,
};
