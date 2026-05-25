import { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertOctagon, Download, Filter } from 'lucide-react';
import { exportToCsv } from '../utils/exportCsv';

const API = 'http://localhost:5000/api';

const Alertas = () => {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [nivel, setNivel] = useState('');
  const limit = 15;

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchAlertas = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page, limit });
        if (nivel) params.append('nivel', nivel);

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
  }, [page, nivel]);

  const handleExport = () => {
    exportToCsv(alertas.map(a => ({
      Data: new Date(a.criado_em).toLocaleString('pt-BR'),
      Cliente: a.cliente_nome,
      'Nível de Risco': a.nivel_risco,
      Descrição: a.descricao
    })), 'alertas_creditguard.csv');
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center">
            <AlertOctagon className="w-8 h-8 mr-3 text-red-500" />
            Central de Alertas
          </h2>
          <p className="text-gray-400 mt-1">Monitoramento de quebras de contrato e inadimplência</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
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
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
              nivel === n
                ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-900/30'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
            }`}
          >
            <Filter className="w-3.5 h-3.5 inline mr-1.5" />
            {n || 'Todos'}
          </button>
        ))}
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Data do Alerta</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Cliente Afetado</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Nível de Risco</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Descrição</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500 animate-pulse">Monitorando risco de crédito...</td></tr>
              ) : alertas.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">Nenhum alerta encontrado para este filtro.</td></tr>
              ) : alertas.map((alerta) => (
                <tr key={alerta.id} className="hover:bg-gray-700/40 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(alerta.criado_em).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-200">
                    {alerta.cliente_nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  <td className="px-6 py-4 text-sm text-gray-300 max-w-md truncate">
                    {alerta.descricao}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-700 bg-gray-900/30 flex items-center justify-between">
          <span className="text-sm text-gray-400">
            Alertas {(page - 1) * limit + 1} a {Math.min(page * limit, total)} de {total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border border-gray-700 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page * limit >= total}
              className="px-3 py-1.5 border border-gray-700 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50 transition-colors"
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
