const { StatusCodes } = require("http-status-codes");

const hasRole = (user, role) => {
  const roles = (user?.roles || "")
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);
  return roles.includes(role);
};

const requireManager = (req, res, next) => {
  if (!hasRole(req.user, "manager")) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Manager access required." });
  }
  return next();
};

module.exports = { hasRole, requireManager };
