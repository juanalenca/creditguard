import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchClientes = async (pageNumber) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/clientes?page=${pageNumber}`);
      setClientes(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      console.error("Erro ao buscar clientes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes(page);
  }, [page]);

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Clientes</h2>
          <p className="text-slate-500 text-sm mt-1">Gestão da carteira de crédito ({total} registros)</p>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Buscar por nome ou CPF..." 
            className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Carregando dados...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600">
                    <th className="p-4 font-semibold">Nome do Cliente</th>
                    <th className="p-4 font-semibold">CPF/CNPJ</th>
                    <th className="p-4 font-semibold">Telefone</th>
                    <th className="p-4 font-semibold">Cidade / UF</th>
                    <th className="p-4 font-semibold">Data Cadastro</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente) => (
                    <tr key={cliente.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-medium text-slate-800">{cliente.nome}</td>
                      <td className="p-4 text-slate-600">{cliente.cpf_cnpj}</td>
                      <td className="p-4 text-slate-600">{cliente.telefone}</td>
                      <td className="p-4 text-slate-600">{cliente.cidade} - {cliente.estado}</td>
                      <td className="p-4 text-slate-600">
                        {new Date(cliente.data_cadastro).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                  {clientes.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-500">Nenhum cliente encontrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="text-sm text-slate-600">
                Página {page} de {totalPages || 1}
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 flex items-center"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || totalPages === 0}
                  className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 flex items-center"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Clientes;
