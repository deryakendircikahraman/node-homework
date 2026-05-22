const { StatusCodes } = require("http-status-codes");

// Express requires a 4-arg signature to register as error-handling middleware.
const errorHandlerMiddleware = async (err, req, res) => {
  if (err.name === "PrismaClientInitializationError") {
    console.error("Couldn't connect to the database. Is it running?");
  }

  if (err?.code === "ECONNREFUSED" && err?.port === 5432) {
    console.log(
      "The database connection was refused.  Is your database service running?",
    );
  }

  console.error(
    "Internal server error: ",
    err?.constructor?.name,
    JSON.stringify(err, ["name", "message", "stack"]),
  );

  if (!res.headersSent) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "An internal server error occurred." });
  }
};

module.exports = errorHandlerMiddleware;
