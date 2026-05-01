const { StatusCodes } = require("http-status-codes");
const crypto = require("crypto");
const util = require("util");
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

const register = async (req, res) => {
  if (!req.body) req.body = {};
  const { error, value } = userSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }

  const { password, ...rest } = value;
  const hashedPassword = await hashPassword(password);
  const newUser = { ...rest, hashedPassword };

  global.users.push(newUser);
  global.user_id = newUser;

  return res.status(StatusCodes.CREATED).json(rest);
};

const logon = async (req, res) => {
  if (!req.body) req.body = {};
  const { email, password } = req.body;
  const foundUser = global.users.find((u) => u.email === email);

  if (!foundUser) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Authentication Failed" });
  }

  const ok = await comparePassword(password, foundUser.hashedPassword);
  if (!ok) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Authentication Failed" });
  }

  global.user_id = foundUser;
  return res.status(StatusCodes.OK).json({ name: foundUser.name, email: foundUser.email });
};

const logoff = async (req, res) => {
  global.user_id = null;
  return res.status(StatusCodes.OK).end();
};

module.exports = { register, logon, logoff };
