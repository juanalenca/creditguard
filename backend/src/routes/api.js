const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

router.get('/kpis', apiController.getKpis);
router.get('/dashboard/evolucao', apiController.getEvolucao);
router.get('/dashboard/risco-regional', apiController.getRiscoRegional);
router.get('/clientes', apiController.getClientes);
router.get('/clientes/criticos', apiController.getClientesCriticos);

module.exports = router;
