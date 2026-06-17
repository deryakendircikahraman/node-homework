const { StatusCodes } = require("http-status-codes");
const prisma = require("../db/prisma");
const { backlogSchema } = require("../validation/taskSchema");

const index = async (req, res, next = () => {}) => {
  try {
    const items = await prisma.backlog.findMany({
      where: { userId: req.user.id },
      select: { id: true, title: true, priority: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return res.status(StatusCodes.OK).json({ backlog: items });
  } catch (err) {
    return next(err);
  }
};

const create = async (req, res, next = () => {}) => {
  try {
    if (!req.body) req.body = {};
    const { error, value } = backlogSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }

    const item = await prisma.backlog.create({
      data: {
        title: value.title,
        priority: value.priority,
        userId: req.user.id,
      },
      select: { id: true, title: true, priority: true, createdAt: true },
    });
    return res.status(StatusCodes.CREATED).json(item);
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next = () => {}) => {
  try {
    const id = parseInt(req.params?.id, 10);
    if (!id) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid backlog item ID." });
    }

    if (!req.body) req.body = {};
    const { error, value } = backlogSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }

    try {
      const item = await prisma.backlog.update({
        where: { id, userId: req.user.id },
        data: value,
        select: { id: true, title: true, priority: true, createdAt: true },
      });
      return res.status(StatusCodes.OK).json(item);
    } catch {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Backlog item not found." });
    }
  } catch (err) {
    return next(err);
  }
};

const deleteItem = async (req, res, next = () => {}) => {
  try {
    const id = parseInt(req.params?.id, 10);
    if (!id) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid backlog item ID." });
    }

    try {
      const deleted = await prisma.backlog.delete({
        where: { id, userId: req.user.id },
        select: { id: true, title: true, priority: true, createdAt: true },
      });
      return res.status(StatusCodes.OK).json(deleted);
    } catch {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Backlog item not found." });
    }
  } catch (err) {
    return next(err);
  }
};

const claim = async (req, res, next = () => {}) => {
  try {
    const id = parseInt(req.params?.id, 10);
    if (!id) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid backlog item ID." });
    }

    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.backlog.findFirst({
        where: { id, userId: req.user.id },
      });
      if (!item) {
        return null;
      }

      const task = await tx.task.create({
        data: {
          title: item.title,
          priority: item.priority,
          userId: req.user.id,
        },
        select: { id: true, title: true, priority: true, isCompleted: true, createdAt: true },
      });

      await tx.backlog.delete({ where: { id: item.id } });
      return task;
    });

    if (!result) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Backlog item not found." });
    }
    return res.status(StatusCodes.CREATED).json(result);
  } catch (err) {
    return next(err);
  }
};

module.exports = { index, create, update, deleteItem, claim };
