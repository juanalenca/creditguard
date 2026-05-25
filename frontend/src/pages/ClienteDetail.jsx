import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, CheckCircle2, XCircle } from 'lucide-react';

const ClienteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/clientes/${id}`, { headers });
        setCliente(res.data);
      } catch (err) {
        console.error("Erro ao buscar detalhes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCliente();
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-full"><div className="text-xl font-semibold text-gray-400">Carregando detalhes...</div></div>;
  if (!cliente) return <div className="text-red-400 text-center mt-10">Cliente não encontrado.</div>;

  return (
    <div className="space-y-6 pb-10">
      <button 
        onClick={() => navigate('/clientes')}
        className="flex items-center text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Voltar para Carteira
      </button>

      <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-lg flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-white">{cliente.nome}</h2>
          <p className="text-gray-400 mt-2 flex items-center">
            <span className="font-mono bg-gray-900 px-2 py-1 rounded text-sm mr-4">{cliente.cpf_cnpj}</span>
            {cliente.cidade} - {cliente.estado} ({cliente.regiao})
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Status Geral</p>
          <span className="inline-flex items-center px-3 py-1 mt-1 rounded-full text-sm font-bold bg-gray-900 border border-gray-700 text-white">
            Análise em Tempo Real
          </span>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white border-b border-gray-800 pb-2 flex items-center">
          <FileText className="w-6 h-6 mr-2 text-blue-500" />
          Contratos e Pagamentos
        </h3>
        
        {cliente.contratos?.map(contrato => (
          <div key={contrato.id} className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-5 border-b border-gray-700 bg-gray-800/80 flex justify-between items-center">
              <div>
                <h4 className="text-lg font-semibold text-gray-200">Contrato #{contrato.id}</h4>
                <p className="text-sm text-gray-400 mt-1 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Concedido em: {new Date(contrato.data_contrato).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-400">R$ {Number(contrato.valor_total).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                <p className="text-sm text-gray-400">Taxa: {Number(contrato.taxa_juros).toFixed(2)}% | {contrato.numero_parcelas}x</p>
              </div>
            </div>
            
            <div className="p-5 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700/50">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vencimento</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pagamento</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {contrato.parcelas?.map((p, idx) => {
                    const isAtrasado = !p.data_pagamento && new Date(p.data_vencimento) < new Date();
                    const isPago = !!p.data_pagamento;
                    
                    return (
                      <tr key={p.id} className="hover:bg-gray-800/30">
                        <td className="px-4 py-3 text-sm text-gray-300">{new Date(p.data_vencimento).toLocaleDateString('pt-BR')}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-300">R$ {Number(p.valor_parcela).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">{p.data_pagamento ? new Date(p.data_pagamento).toLocaleDateString('pt-BR') : '-'}</td>
                        <td className="px-4 py-3 text-sm">
                          {isPago ? (
                            <span className="flex items-center text-emerald-400 text-xs font-semibold">
                              <CheckCircle2 className="w-4 h-4 mr-1" /> Pago
                            </span>
                          ) : isAtrasado ? (
                            <span className="flex items-center text-red-400 text-xs font-semibold">
                              <XCircle className="w-4 h-4 mr-1" /> Atrasado
                            </span>
                          ) : (
                            <span className="flex items-center text-gray-500 text-xs font-semibold">
                              <Calendar className="w-4 h-4 mr-1" /> A Vencer
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
        {(!cliente.contratos || cliente.contratos.length === 0) && (
          <p className="text-gray-500">Nenhum contrato encontrado para este cliente.</p>
        )}
      </div>
    </div>
  );
};

export default ClienteDetail;
