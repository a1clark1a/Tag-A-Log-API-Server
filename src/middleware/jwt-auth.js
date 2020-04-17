const AuthService = require("../auth/auth-service");
const logger = require("../middleware/logger");

function requireAuth(req, res, next) {
  const knexInstance = req.app.get("db");
  const authToken = req.get("Authorization") || "";
  let bearerToken;

  if (!authToken.toLowerCase().startsWith("bearer")) {
    logger.error("empty bearer token");
    return res.status(401).json({
      error: { message: `Missing bearer token` },
    });
  } else {
    bearerToken = authToken.slice(7, authToken.length);
  }

  try {
    const payload = AuthService.verifyJwt(bearerToken);
    // req.user = { user_id: payload.user_id, user_name: payload.sub };
    AuthService.getUserWithUserName(knexInstance, payload.sub)
      .then((user) => {
        if (!user) {
          logger.error("is not user");
          return res.status(401).json({
            error: { message: `Unauthorized request` },
          });
        }
        req.user = user;
        next();
      })
      .catch((err) => {
        logger.error(err);
        next(err);
      });
  } catch (error) {
    logger.error("is not user - error in authentication ");
    res.status(401).json({
      error: { message: `Unauthorized request` },
    });
  }
}

module.exports = {
  requireAuth,
};
