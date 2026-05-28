const { StatusCodes } = require("http-status-codes");
const { Prisma } = require("@prisma/client");
const prisma = require("../db/prisma");
const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");

const taskSelect = {
  id: true,
  title: true,
  isCompleted: true,
  priority: true,
  createdAt: true,
};

const userSelect = {
  name: true,
  email: true,
};

const buildPagination = (page, limit, total) => ({
  page,
  limit,
  total,
  pages: Math.ceil(total / limit),
  hasNext: page * limit < total,
  hasPrev: page > 1,
});

const getOrderBy = (query) => {
  const validSortFields = ["title", "priority", "createdAt", "id", "isCompleted"];
  const sortBy = query.sortBy || "createdAt";
  const sortDirection = query.sortDirection === "asc" ? "asc" : "desc";

  if (validSortFields.includes(sortBy)) {
    return { [sortBy]: sortDirection };
  }
  return { createdAt: "desc" };
};

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
        priority: value.priority,
        userId: req.user.id,
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
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const whereClause = { userId: req.user.id };

    if (req.query.find) {
      whereClause.title = {
        contains: req.query.find,
        mode: "insensitive",
      };
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      select: {
        ...taskSelect,
        User: { select: userSelect },
      },
      skip,
      take: limit,
      orderBy: getOrderBy(req.query),
    });

    const totalTasks = await prisma.task.count({ where: whereClause });
    const pagination = buildPagination(page, limit, totalTasks);

    return res.status(StatusCodes.OK).json({ tasks, pagination });
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
        id_userId: { id: taskId, userId: req.user.id },
      },
      select: {
        ...taskSelect,
        User: { select: userSelect },
      },
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
          id_userId: { id: taskId, userId: req.user.id },
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
          id_userId: { id: taskId, userId: req.user.id },
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

const bulkCreate = async (req, res, next = () => {}) => {
  try {
    const { tasks } = req.body;

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Invalid request data. Expected an array of tasks.",
      });
    }

    const validTasks = [];
    for (const task of tasks) {
      const { error, value } = taskSchema.validate(task);
      if (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: "Validation failed",
          details: error.details,
        });
      }
      validTasks.push({
        title: value.title,
        isCompleted: value.isCompleted || false,
        priority: value.priority || "medium",
        userId: req.user.id,
      });
    }

    const result = await prisma.task.createMany({
      data: validTasks,
      skipDuplicates: false,
    });

    return res.status(StatusCodes.CREATED).json({
      message: "success!",
      tasksCreated: result.count,
      totalRequested: validTasks.length,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = { create, index, show, update, deleteTask, bulkCreate };
