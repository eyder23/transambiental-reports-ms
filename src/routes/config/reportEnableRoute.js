// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const express = require('express');
const reportEnableController = require('../../controllers/config/reportEnableController');

const router = express.Router();
router.post('/create', reportEnableController.createReport);

router.get('/getReport/:id', reportEnableController.getReport);

router.get('/getReportByCode/:code', reportEnableController.getReportByCode);

router.get('/all', reportEnableController.getAllAllReports);

router.get('/allByType', reportEnableController.getAllAllReportsByType);
module.exports = router;
