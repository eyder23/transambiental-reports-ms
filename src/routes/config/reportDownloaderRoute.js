// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const express = require('express');
const reportDownloaderController = require('../../controllers/config/reportDownloaderController');

const router = express.Router();
router.post('/create', reportDownloaderController.createReport);

router.get('/getReport/:id', reportDownloaderController.getReport);
router.get('/get', reportDownloaderController.get);
router.get('/all', reportDownloaderController.getAllAllReports);

module.exports = router;
