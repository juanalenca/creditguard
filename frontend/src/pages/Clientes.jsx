import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Download, MapPin } from 'lucide-react';
import { exportToCsv } from '../utils/exportCsv';

const API = 'http://localhost:5000/api';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [busca, setBusca] = useState('');
  const [regiao, setRegiao] = useState('');
  const limit = 10;
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchClientes = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page, limit });
        if (busca) params.append('busca', busca);
        if (regiao) params.append('regiao', regiao);
        
        const res = await axios.get(`${API}/clientes?${params}`, { headers });
        setClientes(res.data.data);
        setTotal(res.data.total);
      } catch (err) {
        console.error("Erro ao buscar clientes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClientes();
  }, [page, regiao]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      const fetchFiltered = async () => {
        try {
          const params = new URLSearchParams({ page: 1, limit });
          if (busca) params.append('busca', busca);
          if (regiao) params.append('regiao', regiao);
          
          const res = await axios.get(`${API}/clientes?${params}`, { headers });
          setClientes(res.data.data);
          setTotal(res.data.total);
        } catch (err) {
          console.error("Erro ao buscar", err);
        }
      };
      if (busca.length >= 2 || busca.length === 0) fetchFiltered();
    }, 400);
    return () => clearTimeout(timer);
  }, [busca]);

  const handleExport = () => {
    exportToCsv(clientes.map(c => ({
      ID: c.id,
      Nome: c.nome,
      'CPF/CNPJ': c.cpf_cnpj,
      Telefone: c.telefone || '',
      Região: c.regiao,
      Cidade: c.cidade,
      Estado: c.estado
    })), 'clientes_creditguard.csv');
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Carteira de Clientes</h2>
          <p className="text-gray-400 mt-1">Gestão de mutuários e análise de risco individual</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por nome ou CPF/CNPJ..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <Search className="w-5 h-5 text-gray-500 absolute left-3 top-3" />
        </div>
        <div className="relative">
          <select
            value={regiao}
            onChange={(e) => { setRegiao(e.target.value); setPage(1); }}
            className="pl-10 pr-8 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
          >
            <option value="">Todas as Regiões</option>
            <option value="Nordeste">Nordeste</option>
            <option value="Sudeste">Sudeste</option>
            <option value="Sul">Sul</option>
            <option value="Norte">Norte</option>
            <option value="Centro-Oeste">Centro-Oeste</option>
          </select>
          <MapPin className="w-5 h-5 text-gray-500 absolute left-3 top-3 pointer-events-none" />
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Nome do Cliente</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Documento</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Região</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Cidade / UF</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading && page === 1 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500 animate-pulse">Carregando clientes...</td></tr>
              ) : clientes.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Nenhum cliente encontrado.</td></tr>
              ) : clientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-700/40 transition-colors group cursor-pointer" onClick={() => navigate(`/clientes/${cliente.id}`)}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">#{cliente.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-200">{cliente.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">{cliente.cpf_cnpj}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400 border border-blue-800/50">
                      {cliente.regiao}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{cliente.cidade} - {cliente.estado}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-500 hover:text-blue-400 flex items-center justify-end w-full group-hover:translate-x-1 transition-transform">
                      Detalhes <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-700 bg-gray-900/30 flex items-center justify-between">
          <span className="text-sm text-gray-400">
            Mostrando <span className="font-medium text-gray-200">{(page - 1) * limit + 1}</span> a <span className="font-medium text-gray-200">{Math.min(page * limit, total)}</span> de <span className="font-medium text-gray-200">{total}</span> clientes
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border border-gray-700 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page * limit >= total}
              className="px-3 py-1.5 border border-gray-700 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Próxima
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clientes;
