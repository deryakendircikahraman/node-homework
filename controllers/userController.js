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
  const { email, name } = value;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { email, name, hashedPassword },
        select: { id: true, email: true, name: true },
      });

      const welcomeTaskData = [
        { title: "Complete your profile", userId: newUser.id, priority: "medium" },
        { title: "Add your first task", userId: newUser.id, priority: "high" },
        { title: "Explore the app", userId: newUser.id, priority: "low" },
      ];
      await tx.task.createMany({ data: welcomeTaskData });

      const welcomeTasks = await tx.task.findMany({
        where: {
          userId: newUser.id,
          title: { in: welcomeTaskData.map((t) => t.title) },
        },
        select: {
          id: true,
          title: true,
          isCompleted: true,
          userId: true,
          priority: true,
        },
      });

      return { user: newUser, welcomeTasks };
    });

    global.user_id = result.user.id;

    return res.status(StatusCodes.CREATED).json({
      user: result.user,
      welcomeTasks: result.welcomeTasks,
      transactionStatus: "success",
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Email already registered" });
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
      select: {
        id: true,
        name: true,
        email: true,
        hashedPassword: true,
      },
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
