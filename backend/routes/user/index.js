const express = require("express");
const router = express.Router();
const { getUserPortfolio } = require("./userController");

router.get("/:id", getUserPortfolio);

module.exports = router;
