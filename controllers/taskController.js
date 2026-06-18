const { StatusCodes } = require("http-status-codes");
const { Prisma } = require("@prisma/client");
const prisma = require("../db/prisma");
const {
  taskSchema,
  patchTaskSchema,
} = require("../validation/taskSchema");

const taskSelect = {
  id: true,
  title: true,
  isCompleted: true,
  priority: true,
  folderId: true,
  trash: true,
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

const buildWhereClause = (req) => {
  const whereClause = { userId: req.user.id };

  if (req.query.trash === "true") {
    whereClause.trash = true;
  } else if (req.query.trash === "all") {
    // include both trash and non-trash
  } else {
    whereClause.trash = false;
  }

  if (req.query.folder) {
    const folderId = parseInt(req.query.folder, 10);
    if (folderId) {
      whereClause.folderId = folderId;
    }
  }

  if (req.query.isCompleted !== undefined) {
    whereClause.isCompleted = req.query.isCompleted === "true";
  }

  if (req.query.find) {
    whereClause.title = {
      contains: req.query.find,
      mode: "insensitive",
    };
  }

  return whereClause;
};

const create = async (req, res, next = () => {}) => {
  try {
    if (!req.body) req.body = {};
    const { error, value } = taskSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }

    if (value.folderId) {
      const folder = await prisma.folder.findFirst({
        where: { id: value.folderId, userId: req.user.id },
      });
      if (!folder) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Folder not found." });
      }
    }

    const task = await prisma.task.create({
      data: {
        title: value.title,
        isCompleted: value.isCompleted,
        priority: value.priority,
        folderId: value.folderId ?? null,
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
    const whereClause = buildWhereClause(req);

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

    if (value.folderId) {
      const folder = await prisma.folder.findFirst({
        where: { id: value.folderId, userId: req.user.id },
      });
      if (!folder) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Folder not found." });
      }
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
      const deleted = await prisma.task.update({
        where: {
          id_userId: { id: taskId, userId: req.user.id },
        },
        data: { trash: true },
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

const emptyTrash = async (req, res, next = () => {}) => {
  try {
    const result = await prisma.task.deleteMany({
      where: { userId: req.user.id, trash: true },
    });
    return res.status(StatusCodes.OK).json({
      message: "Trash emptied.",
      deletedCount: result.count,
    });
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
        folderId: value.folderId ?? null,
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

const bulkUpdateMany = async (req, res, next = () => {}) => {
  try {
    if (!req.body) req.body = {};
    const { error, value } = patchTaskSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }

    const whereClause = buildWhereClause(req);
    const result = await prisma.task.updateMany({
      where: whereClause,
      data: value,
    });

    return res.status(StatusCodes.OK).json({
      message: "Tasks updated.",
      updatedCount: result.count,
    });
  } catch (err) {
    return next(err);
  }
};

const bulkDeleteMany = async (req, res, next = () => {}) => {
  try {
    const whereClause = buildWhereClause(req);
    const result = await prisma.task.updateMany({
      where: whereClause,
      data: { trash: true },
    });

    return res.status(StatusCodes.OK).json({
      message: "Tasks moved to trash.",
      deletedCount: result.count,
    });
  } catch (err) {
    return next(err);
  }
};

const bulkUpdateByIds = async (req, res, next = () => {}) => {
  try {
    const { ids, ...updateData } = req.body || {};
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Expected a non-empty array of task IDs.",
      });
    }

    const { error, value } = patchTaskSchema.validate(updateData, { abortEarly: false });
    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }

    const result = await prisma.task.updateMany({
      where: {
        userId: req.user.id,
        id: { in: ids.map((id) => parseInt(id, 10)).filter(Boolean) },
      },
      data: value,
    });

    return res.status(StatusCodes.OK).json({
      message: "Tasks updated.",
      updatedCount: result.count,
    });
  } catch (err) {
    return next(err);
  }
};

const bulkDeleteByIds = async (req, res, next = () => {}) => {
  try {
    const { ids } = req.body || {};
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Expected a non-empty array of task IDs.",
      });
    }

    const result = await prisma.task.updateMany({
      where: {
        userId: req.user.id,
        id: { in: ids.map((id) => parseInt(id, 10)).filter(Boolean) },
      },
      data: { trash: true },
    });

    return res.status(StatusCodes.OK).json({
      message: "Tasks moved to trash.",
      deletedCount: result.count,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  create,
  index,
  show,
  update,
  deleteTask,
  emptyTrash,
  bulkCreate,
  bulkUpdateMany,
  bulkDeleteMany,
  bulkUpdateByIds,
  bulkDeleteByIds,
};
