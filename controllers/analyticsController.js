const { StatusCodes } = require("http-status-codes");
const prisma = require("../db/prisma");

const buildPagination = (page, limit, total) => ({
  page,
  limit,
  total,
  pages: Math.ceil(total / limit),
  hasNext: page * limit < total,
  hasPrev: page > 1,
});

const getUserAnalytics = async (req, res, next = () => {}) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid user ID" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
    }

    const taskStats = await prisma.task.groupBy({
      by: ["isCompleted"],
      where: { userId, trash: false },
      _count: { id: true },
    });

    const recentTasks = await prisma.task.findMany({
      where: { userId, trash: false },
      select: {
        id: true,
        title: true,
        isCompleted: true,
        priority: true,
        createdAt: true,
        userId: true,
        User: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyProgress = await prisma.task.groupBy({
      by: ["createdAt"],
      where: {
        userId,
        trash: false,
        createdAt: { gte: oneWeekAgo },
      },
      _count: { id: true },
    });

    return res.status(StatusCodes.OK).json({
      taskStats,
      recentTasks,
      weeklyProgress,
    });
  } catch (err) {
    return next(err);
  }
};

const getUsersWithStats = async (req, res, next = () => {}) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const usersRaw = await prisma.user.findMany({
      include: {
        Task: {
          where: { isCompleted: false, trash: false },
          select: { id: true },
          take: 5,
        },
        _count: {
          select: {
            Task: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const users = usersRaw.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      _count: user._count,
      Task: user.Task,
    }));

    const totalUsers = await prisma.user.count();
    const pagination = buildPagination(page, limit, totalUsers);

    return res.status(StatusCodes.OK).json({ users, pagination });
  } catch (err) {
    return next(err);
  }
};

const searchTasks = async (req, res, next = () => {}) => {
  try {
    const searchQuery = req.query.q?.trim();
    if (!searchQuery || searchQuery.length < 2) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Search query must be at least 2 characters long",
      });
    }

    const limit = parseInt(req.query.limit, 10) || 20;
    const searchPattern = `%${searchQuery}%`;
    const exactMatch = searchQuery;
    const startsWith = `${searchQuery}%`;

    const results = await prisma.$queryRaw`
      SELECT
        t.id,
        t.title,
        t.is_completed as "isCompleted",
        t.priority,
        t.created_at as "createdAt",
        t.user_id as "userId",
        u.name as "user_name"
      FROM tasks t
      JOIN users u ON t.user_id = u.id
      WHERE t.trash = false
        AND (t.title ILIKE ${searchPattern}
         OR u.name ILIKE ${searchPattern})
      ORDER BY
        CASE
          WHEN t.title ILIKE ${exactMatch} THEN 1
          WHEN t.title ILIKE ${startsWith} THEN 2
          WHEN t.title ILIKE ${searchPattern} THEN 3
          ELSE 4
        END,
        t.created_at DESC
      LIMIT ${limit}
    `;

    return res.status(StatusCodes.OK).json({
      results,
      query: searchQuery,
      count: results.length,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = { getUserAnalytics, getUsersWithStats, searchTasks };
