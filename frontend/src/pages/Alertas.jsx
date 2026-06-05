import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AlertOctagon, Download, Filter } from 'lucide-react';
import { exportToCsv } from '../utils/exportCsv';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Alertas = () => {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [nivel, setNivel] = useState('');
  const limit = 15;

  const token = localStorage.getItem('token');
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  useEffect(() => {
    const fetchAlertas = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page, limit });
        if (nivel) params.append('nivel_risco', nivel);

        const res = await axios.get(`${API}/alertas?${params}`, { headers });
        setAlertas(res.data.data);
        setTotal(res.data.total);
      } catch (err) {
        console.error("Erro ao buscar alertas", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlertas();
  }, [page, nivel, headers]);

  const handleExport = () => {
    exportToCsv(alertas.map(a => ({
      Data: new Date(a.criado_em).toLocaleString('pt-BR'),
      Contrato: a.id_contrato,
      Região: a.regiao,
      Assessoria: a.nome_assessoria,
      'Nível de Risco': a.nivel_risco,
      Descrição: a.descricao
    })), 'alertas_creditguard.csv');
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400 tracking-tight flex items-center">
            <AlertOctagon className="w-8 h-8 mr-3 text-red-500" />
            Central de Alertas
          </h2>
          <p className="text-red-200/60 mt-1 font-medium tracking-wide">Monitoramento de quebras de contrato e inadimplência</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center px-5 py-2.5 bg-gray-900/50 backdrop-blur-sm border border-white/10 text-gray-300 rounded-xl hover:bg-white/5 transition-all shadow-lg hover:shadow-red-500/10 hover:-translate-y-0.5"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </button>
      </div>

      {/* Filtro de nível */}
      <div className="flex gap-2">
        {['', 'Alto', 'Medio', 'Baixo'].map((n) => (
          <button
            key={n}
            onClick={() => { setNivel(n); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-300 ${
              nivel === n
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-transparent text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                : 'bg-gray-900/40 backdrop-blur-md border-white/5 text-gray-400 hover:bg-white/5 hover:text-gray-200'
            }`}
          >
            <Filter className="w-3.5 h-3.5 inline mr-1.5" />
            {n || 'Todos'}
          </button>
        ))}
      </div>

      <div className="bg-gray-900/40 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/5">
            <thead className="bg-white/5">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Data</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Contrato</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Região</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Nível</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Descrição</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 animate-pulse">Monitorando risco de crédito...</td></tr>
              ) : alertas.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Nenhum alerta encontrado para este filtro.</td></tr>
              ) : alertas.map((alerta) => (
                <tr key={alerta.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(alerta.criado_em).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm font-mono text-purple-400">
                    {alerta.id_contrato}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-300">
                    {alerta.regiao}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${
                      alerta.nivel_risco === 'Alto'
                        ? 'bg-red-900/40 text-red-400 border-red-800'
                        : alerta.nivel_risco === 'Medio'
                          ? 'bg-amber-900/40 text-amber-400 border-amber-800'
                          : 'bg-emerald-900/40 text-emerald-400 border-emerald-800'
                    }`}>
                      {alerta.nivel_risco}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-300 max-w-sm truncate">
                    {alerta.descricao}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-white/5 bg-white/5 flex items-center justify-between">
          <span className="text-sm text-gray-400">
            Alertas {(page - 1) * limit + 1} a {Math.min(page * limit, total)} de {total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-white/10 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 disabled:opacity-50 transition-all duration-300"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page * limit >= total}
              className="px-4 py-2 border border-white/10 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 disabled:opacity-50 transition-all duration-300"
            >
              Próxima
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alertas;
