const express = require("express");
const router = express.Router();

const jwtMiddleware = require("../middleware/jwtMiddleware");
const { index, create } = require("../controllers/folderController");

router.use(jwtMiddleware);

router.route("/").get(index).post(create);

module.exports = router;
