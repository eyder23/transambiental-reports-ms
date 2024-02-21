// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const express = require('express');
const controller = require('../../controllers/cliente/clienteController');
const upload = require('../../middlewares/upload');
const router = express.Router();

router.post('/load', upload.single('file'), controller.loadClientes);
router.get('/all', controller.getAllTable);

module.exports = router;
