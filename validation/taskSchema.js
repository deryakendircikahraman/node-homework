const Joi = require("joi");

const taskSchema = Joi.object({
  title: Joi.string().trim().min(3).max(30).required(),
  isCompleted: Joi.boolean().default(false).not(null),
  priority: Joi.string().valid("low", "medium", "high").default("medium"),
  folderId: Joi.number().integer().positive().allow(null),
});

const patchTaskSchema = Joi.object({
  title: Joi.string().trim().min(3).max(30).not(null),
  isCompleted: Joi.boolean().not(null),
  priority: Joi.string().valid("low", "medium", "high").not(null),
  folderId: Joi.number().integer().positive().allow(null),
  trash: Joi.boolean().not(null),
})
  .min(1)
  .message("No attributes to change were specified.");

const folderSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).required(),
});

const backlogSchema = Joi.object({
  title: Joi.string().trim().min(3).max(255).required(),
  priority: Joi.string().valid("low", "medium", "high").default("medium"),
});

const taskLogSchema = Joi.object({
  message: Joi.string().trim().min(1).max(500).required(),
});

module.exports = {
  taskSchema,
  patchTaskSchema,
  folderSchema,
  backlogSchema,
  taskLogSchema,
};
