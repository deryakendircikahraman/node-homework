const { StatusCodes } = require("http-status-codes");
const crypto = require("crypto");
const util = require("util");
const pool = require("../db/pg-pool");
const { userSchema } = require("../validation/userSchema");

const scrypt = util.promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function comparePassword(inputPassword, storedHash) {
  const [salt, key] = storedHash.split(":");
  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = await scrypt(inputPassword, salt, 64);
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

const register = async (req, res, next) => {
  if (!req.body) req.body = {};
  const { error, value } = userSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Validation failed",
      details: error.details,
    });
  }

  const hashedPassword = await hashPassword(value.password);

  try {
    const user = await pool.query(
      `INSERT INTO users (email, name, hashed_password)
       VALUES ($1, $2, $3)
       RETURNING id, email, name`,
      [value.email, value.name, hashedPassword],
    );

    global.user_id = user.rows[0].id;
    return res.status(StatusCodes.CREATED).json({
      name: user.rows[0].name,
      email: user.rows[0].email,
    });
  } catch (e) {
    if (e.code === "23505") {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Email already registered" });
    }
    return next(e);
  }
};

const logon = async (req, res) => {
  if (!req.body) req.body = {};
  const { email, password } = req.body;

  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  if (!result.rows.length) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Authentication Failed" });
  }

  const ok = await comparePassword(password, result.rows[0].hashed_password);
  if (!ok) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Authentication Failed" });
  }

  global.user_id = result.rows[0].id;
  return res.status(StatusCodes.OK).json({ name: result.rows[0].name, email: result.rows[0].email });
};

const logoff = async (req, res) => {
  global.user_id = null;
  return res.status(StatusCodes.OK).end();
};

module.exports = { register, logon, logoff };

