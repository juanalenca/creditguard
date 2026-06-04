import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Lock, Mail, ShieldCheck, User } from 'lucide-react';

const Register = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      await axios.post(`${API}/register`, {
        nome,
        email,
        password,
        confirmPassword
      });

      setSuccess('Cadastro realizado com sucesso. Redirecionando para o login...');

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao realizar cadastro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/30 via-gray-950 to-gray-950 pointer-events-none" />

      <div className="relative w-full max-w-md p-6 sm:p-10 space-y-8 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl shadow-purple-900/20">
        <div className="flex flex-col items-center">
          <img src="/logo-projeto.png" alt="CreditGuard AI" className="h-48 w-auto object-contain mb-4" />
          <p className="text-gray-500 mt-2">Sistema de Análise de Risco de Crédito</p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 text-sm text-green-400 bg-green-900/30 border border-green-800 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Nome</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Seu nome"
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
              <User className="w-5 h-5 text-gray-600 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="admin@linus.com"
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail className="w-5 h-5 text-gray-600 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Senha</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock className="w-5 h-5 text-gray-600 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Confirmar senha</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <ShieldCheck className="w-5 h-5 text-gray-600 absolute left-3 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/30 hover:shadow-purple-800/40"
          >
            {loading ? 'Cadastrando...' : 'Criar conta'}
          </button>
        </form>

        <div className="text-center">
          <Link to="/login" className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors">
            Já possui conta? Entrar
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
