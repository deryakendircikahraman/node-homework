const { StatusCodes } = require("http-status-codes");
const prisma = require("../db/prisma");
const { folderSchema } = require("../validation/taskSchema");

const index = async (req, res, next = () => {}) => {
  try {
    const folders = await prisma.folder.findMany({
      where: { userId: req.user.id },
      select: { id: true, name: true, createdAt: true },
      orderBy: { name: "asc" },
    });
    return res.status(StatusCodes.OK).json({ folders });
  } catch (err) {
    return next(err);
  }
};

const create = async (req, res, next = () => {}) => {
  try {
    if (!req.body) req.body = {};
    const { error, value } = folderSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }

    const folder = await prisma.folder.create({
      data: { name: value.name, userId: req.user.id },
      select: { id: true, name: true, createdAt: true },
    });
    return res.status(StatusCodes.CREATED).json(folder);
  } catch (err) {
    return next(err);
  }
};

module.exports = { index, create };
