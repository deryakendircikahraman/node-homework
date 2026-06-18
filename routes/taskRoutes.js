const express = require("express");
const router = express.Router();

const {
  index,
  create,
  show,
  update,
  deleteTask,
  bulkCreate,
} = require("../controllers/taskController");

router.post("/bulk", bulkCreate);
router.route("/").get(index).post(create);
router.route("/:id").get(show).patch(update).delete(deleteTask);

module.exports = router;
