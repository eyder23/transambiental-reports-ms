// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const express = require('express');
const controller = require('../../controllers/estadoDeResultados/estadoDeResultadosController');
const upload = require('../../middlewares/upload');
const router = express.Router();

router.post('/load', upload.single('file'), controller.load);
router.delete('/delete', controller.delete);
router.get('/all', controller.getAll);
router.post('/all-advanced-filter', controller.getAllAdvancedFilter);

module.exports = router;
