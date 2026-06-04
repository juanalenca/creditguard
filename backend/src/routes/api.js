const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const auth = require('../middleware/auth');

// Rotas públicas
router.post('/login', apiController.login);
router.post('/register', apiController.register);

// Rotas protegidas por autenticação JWT
router.get('/kpis', auth, apiController.getKpis);
router.get('/kpis/avancados', auth, apiController.getKpisAvancados);
router.get('/dashboard/evolucao', auth, apiController.getEvolucao);
router.get('/dashboard/risco-regional', auth, apiController.getRiscoRegional);
router.get('/clientes', auth, apiController.getClientes);
router.get('/clientes/criticos', auth, apiController.getClientesCriticos);
router.get('/clientes/:id', auth, apiController.getClienteById);
router.get('/alertas', auth, apiController.getAlertas);
router.get('/pagamentos', auth, apiController.getPagamentos);
router.get('/insights', auth, apiController.getInsights);
router.get('/tendencias', auth, apiController.getTendencias);

module.exports = router;