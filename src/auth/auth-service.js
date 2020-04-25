const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config");

const AuthService = {
  //CREATE
  createJwt(subject, payload) {
    return jwt.sign(payload, config.JWT_SECRET, {
      subject,
      algorithm: "HS256",
    });
  },

  //READ
  getUserWithUserName(knex, user_name) {
    return knex("users").where({ user_name }).first();
  },

  //VALIDATE
  comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  },

  verifyJwt(token) {
    return jwt.verify(token, config.JWT_SECRET, {
      algorithms: ["HS256"],
    });
  },
};

module.exports = AuthService;
