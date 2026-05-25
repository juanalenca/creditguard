const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticação JWT.
 * Extrai o token do header Authorization (Bearer <token>),
 * verifica a assinatura e injeta os dados decodificados em req.user.
 */
const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'super_secret_jwt_key_123'
    );

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

module.exports = auth;
