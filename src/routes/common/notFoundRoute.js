// Created By Eyder Ascuntar Rosales
const express = require("express");
const notFoundController = require("../../controllers/common/notFoundController");

const router = express.Router();

router.route("*").all(notFoundController.notFound);

module.exports = router;
