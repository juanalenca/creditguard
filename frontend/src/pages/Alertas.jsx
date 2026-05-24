import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertTriangle, User } from 'lucide-react';

const Alertas = () => {
  const [criticos, setCriticos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCriticos = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/clientes/criticos');
        setCriticos(response.data);
      } catch (error) {
        console.error("Erro ao buscar clientes críticos", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCriticos();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Risco Crítico</h2>
          <p className="text-slate-500 text-sm mt-1">Clientes com atrasos severos (&gt; 60 dias)</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Carregando dados...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-red-50 border-b border-red-100 text-sm text-red-800">
                  <th className="p-4 font-semibold rounded-tl-lg">Status</th>
                  <th className="p-4 font-semibold">Nome do Cliente</th>
                  <th className="p-4 font-semibold">CPF/CNPJ</th>
                  <th className="p-4 font-semibold">Cidade / UF</th>
                  <th className="p-4 font-semibold text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {criticos.map((cliente) => (
                  <tr key={cliente.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        <AlertTriangle className="w-3.5 h-3.5" /> Alto Risco
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                          <User className="w-4 h-4" />
                        </div>
                        {cliente.nome}
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{cliente.cpf_cnpj}</td>
                    <td className="p-4 text-slate-600">{cliente.cidade} - {cliente.estado}</td>
                    <td className="p-4 text-right">
                      <button className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                        Cobrar
                      </button>
                    </td>
                  </tr>
                ))}
                {criticos.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500">Nenhum cliente em risco crítico. Bom trabalho!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alertas;
