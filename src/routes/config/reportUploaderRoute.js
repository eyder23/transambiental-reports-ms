// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const express = require('express');
const reportUploaderController = require('../../controllers/config/reportUploaderController');

const router = express.Router();
router.post('/create', reportUploaderController.createReport);

router.get('/getReport/:id', reportUploaderController.getReport);
router.get('/all', reportUploaderController.getAllAllReports);

router.post('/deleteReport', reportUploaderController.deleteReport);

module.exports = router;
