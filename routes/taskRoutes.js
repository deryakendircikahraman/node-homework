const express = require("express");
const router = express.Router();

const jwtMiddleware = require("../middleware/jwtMiddleware");
const {
  index,
  create,
  show,
  update,
  deleteTask,
  emptyTrash,
  bulkCreate,
  bulkUpdateMany,
  bulkDeleteMany,
  bulkUpdateByIds,
  bulkDeleteByIds,
} = require("../controllers/taskController");

router.use(jwtMiddleware);

router.post("/bulk", bulkCreate);
router.patch("/many", bulkUpdateMany);
router.delete("/many", bulkDeleteMany);
router.patch("/by-ids", bulkUpdateByIds);
router.delete("/by-ids", bulkDeleteByIds);
router.delete("/trash", emptyTrash);
router.route("/").get(index).post(create);
router.route("/:id").get(show).patch(update).delete(deleteTask);

module.exports = router;
