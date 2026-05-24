const kpiService = require('../services/kpiService');

exports.getKpis = async (req, res) => {
  try {
    const kpis = await kpiService.getKpis();
    res.json(kpis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getEvolucao = async (req, res) => {
  try {
    const evolucao = await kpiService.getEvolucao();
    res.json(evolucao);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRiscoRegional = async (req, res) => {
  try {
    const risco = await kpiService.getRiscoRegional();
    res.json(risco);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getClientes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const result = await kpiService.getClientes(page);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getClientesCriticos = async (req, res) => {
  try {
    const criticos = await kpiService.getClientesCriticos();
    res.json(criticos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
