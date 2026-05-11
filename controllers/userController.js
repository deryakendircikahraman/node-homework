const { StatusCodes } = require("http-status-codes");
const crypto = require("crypto");
const util = require("util");
const { Prisma } = require("@prisma/client");
const prisma = require("../db/prisma");
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

const register = async (req, res, next = () => {}) => {
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
    const user = await prisma.user.create({
      data: {
        email: value.email,
        name: value.name,
        hashedPassword,
      },
      select: { id: true, name: true, email: true },
    });

    global.user_id = user.id;
    return res.status(StatusCodes.CREATED).json({
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Email already registered" });
    }
    return next(err);
  }
};

const logon = async (req, res, next = () => {}) => {
  try {
    if (!req.body) req.body = {};
    const { email, password } = req.body;
    const normalizedEmail = typeof email === "string" ? email.toLowerCase() : "";

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (!user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Authentication Failed" });
    }

    const ok = await comparePassword(password, user.hashedPassword);
    if (!ok) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Authentication Failed" });
    }

    global.user_id = user.id;
    return res.status(StatusCodes.OK).json({ name: user.name, email: user.email });
  } catch (err) {
    return next(err);
  }
};

const logoff = async (req, res) => {
  global.user_id = null;
  return res.status(StatusCodes.OK).end();
};

module.exports = { register, logon, logoff };
