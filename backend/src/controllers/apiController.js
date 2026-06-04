const kpiService = require('../services/kpiService');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const user = await kpiService.getUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const isMatch = await bcrypt.compare(password, user.senha_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, perfil: user.perfil },
      process.env.JWT_SECRET || 'super_secret_jwt_key_123',
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: { name: user.nome, email: user.email, perfil: user.perfil }
    });
  } catch (err) { console.error("Erro interno:", err.message, err);
    res.status(500).json({ error: err.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { nome, email, password, confirmPassword } = req.body;

    if (!nome) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Senha é obrigatória' });
    }

    if (!confirmPassword) {
      return res.status(400).json({ error: 'Confirmação de senha é obrigatória' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        error: 'Senha e confirmação de senha devem ser iguais'
      });
    }

    const existingUser = await kpiService.getUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        error: 'Usuário já cadastrado com este email'
      });
    }

    const senhaHash = await bcrypt.hash(password, 10);

    const createdUser = await kpiService.createUser({
      nome,
      email,
      senhaHash
    });

    return res.status(201).json({
      user: {
        id: createdUser.id,
        nome: createdUser.nome,
        email: createdUser.email,
        perfil: createdUser.perfil
      }
    });
  } catch (err) {
    console.error('Erro interno:', err);
    return res.status(500).json({ error: err.message });
  }
};

exports.getKpis = async (req, res) => {
  try {
    const kpis = await kpiService.getKpis();
    res.json(kpis);
  } catch (err) { console.error("Erro interno:", err.message, err);
    res.status(500).json({ error: err.message });
  }
};

exports.getEvolucao = async (req, res) => {
  try {
    const { regiao } = req.query;
    const evolucao = await kpiService.getEvolucao(regiao);
    res.json(evolucao);
  } catch (err) { console.error("Erro interno:", err.message, err);
    res.status(500).json({ error: err.message });
  }
};

exports.getRiscoRegional = async (req, res) => {
  try {
    const { regiao } = req.query;
    const risco = await kpiService.getRiscoRegional(regiao);
    res.json(risco);
  } catch (err) { console.error("Erro interno:", err.message, err);
    res.status(500).json({ error: err.message });
  }
};

exports.getClientes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {
      regiao: req.query.regiao || null,
      status: req.query.status || null,
      busca: req.query.busca || null
    };
    const result = await kpiService.getClientes(page, limit, filters);
    res.json(result);
  } catch (err) {
  console.error("Erro interno:", err.message, err);
  res.status(500).json({ error: err.message });
}
};

exports.getClientesCriticos = async (req, res) => {
  try {
    const criticos = await kpiService.getClientesCriticos();
    res.json(criticos);
  } catch (err) {
  console.error("Erro interno:", err.message, err);
  res.status(500).json({ error: err.message });
}
};

exports.getAlertas = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const nivelRisco = req.query.nivel_risco || null;
    const result = await kpiService.getAlertas(page, limit, nivelRisco);
    res.json(result);
  } catch (err) {
  console.error("Erro interno:", err.message, err);
  res.status(500).json({ error: err.message });
}
};

exports.getPagamentos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await kpiService.getPagamentos(page, limit);
    res.json(result);
  } catch (err) {
  console.error("Erro interno:", err.message, err);
  res.status(500).json({ error: err.message });
}
};

exports.getClienteById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await kpiService.getClienteById(id);
    if (!result) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(result);
  } catch (err) {
  console.error("Erro interno:", err.message, err);
  res.status(500).json({ error: err.message });
}
};

// ─── Novos endpoints ────────────────────────────────────────────────────────────

exports.getKpisAvancados = async (req, res) => {
  try {
    const kpis = await kpiService.getKpisAvancados();
    res.json(kpis);
  } catch (err) {
  console.error("Erro interno:", err.message, err);
  res.status(500).json({ error: err.message });
}
};

exports.getInsights = async (req, res) => {
  try {
    const insights = await kpiService.getInsights();
    res.json(insights);
  } catch (err) {
  console.error("Erro interno:", err.message, err);
  res.status(500).json({ error: err.message });
}
};

exports.getTendencias = async (req, res) => {
  try {
    const tendencias = await kpiService.getTendencias();
    res.json(tendencias);
  } catch (err) {
  console.error("Erro interno:", err.message, err);
  res.status(500).json({ error: err.message });
}
};

