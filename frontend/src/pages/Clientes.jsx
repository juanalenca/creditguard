import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Download, MapPin, Filter } from 'lucide-react';
import { exportToCsv } from '../utils/exportCsv';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Clientes = () => {
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [busca, setBusca] = useState('');
  const [regiao, setRegiao] = useState('');
  const [status, setStatus] = useState('');
  const limit = 10;
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = async (p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit });
      if (busca) params.append('busca', busca);
      if (regiao) params.append('regiao', regiao);
      if (status) params.append('status', status);

      const res = await axios.get(`${API}/clientes?${params}`, { headers });
      setContratos(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      console.error("Erro ao buscar contratos", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, regiao, status]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchData(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [busca]);

  const handleExport = () => {
    exportToCsv(contratos.map(c => ({
      'ID Contrato': c.id_contrato,
      'Assessoria': c.nome_assessoria,
      'Região': c.regiao,
      'Status': c.status_cobranca,
      'Dias Atraso': c.dias_atraso_inicial,
      'Valor Inadimplente': c.valor_inadimplente,
      'Score Risco': c.score_risco,
      'Data Envio': c.data_envio_assessoria
    })), 'contratos_creditguard.csv');
  };

  const statusColor = (s) => {
    switch (s) {
      case 'Acordo Firmado': return 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50';
      case 'Em Aberto': return 'bg-amber-900/30 text-amber-400 border-amber-800/50';
      case 'Insucesso': return 'bg-red-900/30 text-red-400 border-red-800/50';
      case 'Ajuizado': return 'bg-purple-900/30 text-purple-400 border-purple-800/50';
      default: return 'bg-gray-900/30 text-gray-400 border-gray-800/50';
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Portfólio de Contratos</h2>
          <p className="text-gray-400 mt-1">Gestão de cobrança e análise de inadimplência por contrato</p>
        </div>
        <button onClick={handleExport} className="flex items-center px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors w-full sm:w-auto justify-center">
          <Download className="w-4 h-4 mr-2" /> Exportar CSV
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative w-full sm:flex-1">
          <input type="text" placeholder="Buscar por ID do contrato ou assessoria..." value={busca} onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
          <Search className="w-5 h-5 text-gray-500 absolute left-3 top-3" />
        </div>
        <select value={regiao} onChange={(e) => { setRegiao(e.target.value); setPage(1); }}
          className="w-full sm:w-auto px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer">
          <option value="">Todas Regiões</option>
          <option value="Nordeste">Nordeste</option>
          <option value="Sudeste">Sudeste</option>
          <option value="Sul">Sul</option>
          <option value="Norte">Norte</option>
          <option value="Centro-Oeste">Centro-Oeste</option>
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="w-full sm:w-auto px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer">
          <option value="">Todos Status</option>
          <option value="Em Aberto">Em Aberto</option>
          <option value="Acordo Firmado">Acordo Firmado</option>
          <option value="Insucesso">Insucesso</option>
          <option value="Ajuizado">Ajuizado</option>
        </select>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Contrato</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Assessoria</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Região</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                <th className="px-4 py-4 text-right text-xs font-semibold text-gray-400 uppercase">Valor Inadimplente</th>
                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-400 uppercase">Dias Atraso</th>
                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-400 uppercase">Score</th>
                <th className="px-4 py-4 text-right text-xs font-semibold text-gray-400 uppercase"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500 animate-pulse">Carregando portfólio...</td></tr>
              ) : contratos.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">Nenhum contrato encontrado.</td></tr>
              ) : contratos.map((c) => (
                <tr key={c.id} className="hover:bg-gray-700/40 transition-colors group cursor-pointer" onClick={() => navigate(`/clientes/${c.id}`)}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-purple-400">{c.id_contrato}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-200">{c.nome_assessoria}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-900/30 text-purple-400 border border-purple-800/50">{c.regiao}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusColor(c.status_cobranca)}`}>{c.status_cobranca}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-gray-200">
                    R$ {Number(c.valor_inadimplente).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                    <span className={`font-bold ${c.dias_atraso_inicial > 60 ? 'text-red-400' : c.dias_atraso_inicial > 15 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {c.dias_atraso_inicial}d
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-400">{Number(c.score_risco).toFixed(0)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-700 bg-gray-900/30 flex items-center justify-between">
          <span className="text-sm text-gray-400">
            <span className="font-medium text-gray-200">{(page - 1) * limit + 1}</span> a <span className="font-medium text-gray-200">{Math.min(page * limit, total)}</span> de <span className="font-medium text-gray-200">{total.toLocaleString()}</span> contratos
          </span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border border-gray-700 rounded-md text-sm text-gray-300 hover:bg-gray-700 disabled:opacity-50 transition-colors">Anterior</button>
            <button onClick={() => setPage(p => p + 1)} disabled={page * limit >= total} className="px-3 py-1.5 border border-gray-700 rounded-md text-sm text-gray-300 hover:bg-gray-700 disabled:opacity-50 transition-colors">Próxima</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clientes;
