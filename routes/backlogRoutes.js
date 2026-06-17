const express = require("express");
const router = express.Router();

const jwtMiddleware = require("../middleware/jwtMiddleware");
const {
  index,
  create,
  update,
  deleteItem,
  claim,
} = require("../controllers/backlogController");

router.use(jwtMiddleware);

router.route("/").get(index).post(create);
router.post("/:id/claim", claim);
router.route("/:id").patch(update).delete(deleteItem);

module.exports = router;
