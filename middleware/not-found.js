const { StatusCodes } = require("http-status-codes");

const notFoundMiddleware = async (req, res) => {
  return res.status(StatusCodes.NOT_FOUND).json({
    message: `You can't do a ${req.method} for ${req.url}`,
  });
};

module.exports = notFoundMiddleware;

