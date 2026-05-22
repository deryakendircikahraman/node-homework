const { StatusCodes } = require("http-status-codes");
const { Prisma } = require("@prisma/client");
const prisma = require("../db/prisma");
const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");

const taskSelect = { id: true, title: true, isCompleted: true };

const create = async (req, res, next = () => {}) => {
  try {
    if (!req.body) req.body = {};
    const { error, value } = taskSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }

    const task = await prisma.task.create({
      data: {
        title: value.title,
        isCompleted: value.isCompleted,
        userId: global.user_id,
      },
      select: taskSelect,
    });

    return res.status(StatusCodes.CREATED).json(task);
  } catch (err) {
    return next(err);
  }
};

const index = async (req, res, next = () => {}) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: global.user_id },
      orderBy: { id: "asc" },
      select: taskSelect,
    });
    if (!tasks.length) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "No tasks found" });
    }
    return res.status(StatusCodes.OK).json(tasks);
  } catch (err) {
    return next(err);
  }
};

const show = async (req, res, next = () => {}) => {
  try {
    const taskId = parseInt(req.params?.id, 10);
    if (!taskId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "The task ID passed is not valid." });
    }

    const task = await prisma.task.findUnique({
      where: {
        id_userId: { id: taskId, userId: global.user_id },
      },
      select: taskSelect,
    });
    if (!task) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "That task was not found" });
    }
    return res.status(StatusCodes.OK).json(task);
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next = () => {}) => {
  try {
    if (!req.body) req.body = {};
    const { error, value } = patchTaskSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }

    const taskId = parseInt(req.params?.id, 10);
    if (!taskId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "The task ID passed is not valid." });
    }

    try {
      const task = await prisma.task.update({
        where: {
          id_userId: { id: taskId, userId: global.user_id },
        },
        data: value,
        select: taskSelect,
      });
      return res.status(StatusCodes.OK).json(task);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
        return res.status(StatusCodes.NOT_FOUND).json({ message: "That task was not found" });
      }
      return next(err);
    }
  } catch (err) {
    return next(err);
  }
};

const deleteTask = async (req, res, next = () => {}) => {
  try {
    const taskId = parseInt(req.params?.id, 10);
    if (!taskId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "The task ID passed is not valid." });
    }

    try {
      const deleted = await prisma.task.delete({
        where: {
          id_userId: { id: taskId, userId: global.user_id },
        },
        select: taskSelect,
      });
      return res.status(StatusCodes.OK).json(deleted);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
        return res.status(StatusCodes.NOT_FOUND).json({ message: "That task was not found" });
      }
      return next(err);
    }
  } catch (err) {
    return next(err);
  }
};

module.exports = { create, index, show, update, deleteTask };
