const { StatusCodes } = require("http-status-codes");
const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");

const taskCounter = (() => {
  let lastTaskNumber = 0;
  return () => {
    lastTaskNumber += 1;
    return lastTaskNumber;
  };
})();

function sanitizeTask(task) {
  const { userId, ...sanitizedTask } = task;
  return sanitizedTask;
}

const create = async (req, res) => {
  if (!req.body) req.body = {};
  const { error, value } = taskSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }

  const newTask = { ...value, id: taskCounter(), userId: global.user_id.email };
  global.tasks.push(newTask);
  return res.status(StatusCodes.CREATED).json(sanitizeTask(newTask));
};

const index = async (req, res) => {
  const userTasks = global.tasks.filter((task) => task.userId === global.user_id.email);
  if (userTasks.length === 0) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "No tasks found" });
  }

  const sanitizedTasks = userTasks.map((task) => sanitizeTask({ ...task }));
  return res.status(StatusCodes.OK).json(sanitizedTasks);
};

const show = async (req, res) => {
  const taskToFind = parseInt(req.params?.id);
  if (!taskToFind) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "The task ID passed is not valid." });
  }

  const task = global.tasks.find(
    (t) => t.id === taskToFind && t.userId === global.user_id.email,
  );
  if (!task) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "That task was not found" });
  }

  return res.status(StatusCodes.OK).json(sanitizeTask({ ...task }));
};

const update = async (req, res) => {
  if (!req.body) req.body = {};
  const { error, value } = patchTaskSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }

  const taskToFind = parseInt(req.params?.id);
  if (!taskToFind) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "The task ID passed is not valid." });
  }

  const task = global.tasks.find(
    (t) => t.id === taskToFind && t.userId === global.user_id.email,
  );
  if (!task) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "That task was not found" });
  }

  Object.assign(task, value);
  return res.status(StatusCodes.OK).json(sanitizeTask({ ...task }));
};

const deleteTask = async (req, res) => {
  const taskToFind = parseInt(req.params?.id);
  if (!taskToFind) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "The task ID passed is not valid." });
  }

  const taskIndex = global.tasks.findIndex(
    (task) => task.id === taskToFind && task.userId === global.user_id.email,
  );
  if (taskIndex === -1) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "That task was not found" });
  }

  const deletedTask = global.tasks[taskIndex];
  global.tasks.splice(taskIndex, 1);
  return res.status(StatusCodes.OK).json(sanitizeTask({ ...deletedTask }));
};

module.exports = { create, index, show, update, deleteTask };

