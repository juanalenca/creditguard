import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, CheckCircle2, XCircle, Clock, AlertTriangle, Download } from 'lucide-react';
import { exportToCsv } from '../utils/exportCsv';

const API = 'http://localhost:5000/api';

const ClienteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contrato, setContrato] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchContrato = async () => {
      try {
        const res = await axios.get(`${API}/clientes/${id}`, { headers });
        setContrato(res.data);
      } catch (err) {
        console.error("Erro ao buscar detalhes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContrato();
  }, [id]);

  const handleExportParcelas = () => {
    if (!contrato?.parcelas) return;
    exportToCsv(contrato.parcelas.map(p => ({
      Parcela: p.numero_parcela,
      Vencimento: p.data_vencimento,
      Pagamento: p.data_pagamento || 'Não pago',
      'Valor Parcela': p.valor_parcela,
      'Valor Pago': p.valor_pago,
      'Forma': p.forma_pagamento,
      'Contemplado': p.indicador_contemplado ? 'Sim' : 'Não'
    })), `parcelas_${contrato.id_contrato}.csv`);
  };

  if (loading) return <div className="flex items-center justify-center h-full"><div className="text-xl font-semibold text-gray-400 animate-pulse">Carregando detalhes do contrato...</div></div>;
  if (!contrato) return <div className="text-red-400 text-center mt-10">Contrato não encontrado.</div>;

  const totalParcelas = contrato.parcelas?.length || 0;
  const parcelasPagas = contrato.parcelas?.filter(p => p.data_pagamento).length || 0;
  const parcelasAtrasadas = contrato.parcelas?.filter(p => !p.data_pagamento && new Date(p.data_vencimento) < new Date()).length || 0;

  return (
    <div className="space-y-6 pb-10">
      <button onClick={() => navigate('/clientes')} className="flex items-center text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-5 h-5 mr-2" /> Voltar para Portfólio
      </button>

      {/* Cabeçalho do Contrato */}
      <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-lg">
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold text-white font-mono">{contrato.id_contrato}</h2>
            <p className="text-gray-400 mt-2">Assessoria: <span className="text-gray-200 font-medium">{contrato.nome_assessoria}</span></p>
            <p className="text-gray-400 mt-1">Região: <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400 border border-blue-800/50">{contrato.regiao}</span></p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-900 p-4 rounded-lg text-center">
              <p className="text-xs text-gray-500 uppercase">Valor Inadimplente</p>
              <p className="text-xl font-bold text-red-400">R$ {Number(contrato.valor_inadimplente).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg text-center">
              <p className="text-xs text-gray-500 uppercase">Dias Atraso</p>
              <p className={`text-xl font-bold ${contrato.dias_atraso_inicial > 60 ? 'text-red-400' : 'text-amber-400'}`}>{contrato.dias_atraso_inicial}d</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg text-center">
              <p className="text-xs text-gray-500 uppercase">Score Risco</p>
              <p className="text-xl font-bold text-amber-400">{Number(contrato.score_risco).toFixed(0)}</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg text-center">
              <p className="text-xs text-gray-500 uppercase">Status</p>
              <p className="text-lg font-bold text-white">{contrato.status_cobranca}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Resumo de Parcelas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 flex items-center gap-4">
          <div className="p-3 rounded-full bg-blue-900/30"><FileText className="w-6 h-6 text-blue-400" /></div>
          <div><p className="text-sm text-gray-400">Total Parcelas</p><p className="text-2xl font-bold text-white">{totalParcelas}</p></div>
        </div>
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 flex items-center gap-4">
          <div className="p-3 rounded-full bg-emerald-900/30"><CheckCircle2 className="w-6 h-6 text-emerald-400" /></div>
          <div><p className="text-sm text-gray-400">Pagas</p><p className="text-2xl font-bold text-emerald-400">{parcelasPagas}</p></div>
        </div>
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 flex items-center gap-4">
          <div className="p-3 rounded-full bg-red-900/30"><XCircle className="w-6 h-6 text-red-400" /></div>
          <div><p className="text-sm text-gray-400">Atrasadas</p><p className="text-2xl font-bold text-red-400">{parcelasAtrasadas}</p></div>
        </div>
      </div>

      {/* Tabela de Parcelas */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden">
        <div className="p-5 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-200 flex items-center"><FileText className="w-5 h-5 mr-2 text-blue-500" /> Histórico de Parcelas</h3>
          <button onClick={handleExportParcelas} className="flex items-center px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm transition-colors">
            <Download className="w-4 h-4 mr-1" /> CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700/50">
            <thead className="bg-gray-900/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimento</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pagamento</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pago</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Forma</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {contrato.parcelas?.map((p) => {
                const isAtrasado = !p.data_pagamento && new Date(p.data_vencimento) < new Date();
                const isPago = !!p.data_pagamento;
                return (
                  <tr key={p.id} className="hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-sm text-gray-500 font-mono">{p.numero_parcela}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{new Date(p.data_vencimento).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{p.data_pagamento ? new Date(p.data_pagamento).toLocaleDateString('pt-BR') : '-'}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-300">R$ {Number(p.valor_parcela).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-400">R$ {Number(p.valor_pago).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-400">{p.forma_pagamento}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      {isPago ? (
                        <span className="flex items-center justify-center text-emerald-400 text-xs font-semibold"><CheckCircle2 className="w-4 h-4 mr-1" /> Pago</span>
                      ) : isAtrasado ? (
                        <span className="flex items-center justify-center text-red-400 text-xs font-semibold"><XCircle className="w-4 h-4 mr-1" /> Atrasado</span>
                      ) : (
                        <span className="flex items-center justify-center text-gray-500 text-xs font-semibold"><Clock className="w-4 h-4 mr-1" /> A Vencer</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alertas do Contrato */}
      {contrato.alertas?.length > 0 && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg p-5">
          <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center"><AlertTriangle className="w-5 h-5 mr-2 text-red-500" /> Alertas Emitidos</h3>
          <div className="space-y-3">
            {contrato.alertas.map(a => (
              <div key={a.id} className={`p-4 rounded-lg border-l-4 ${a.nivel_risco === 'Alto' ? 'border-red-500 bg-red-900/10' : a.nivel_risco === 'Medio' ? 'border-amber-500 bg-amber-900/10' : 'border-emerald-500 bg-emerald-900/10'}`}>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${a.nivel_risco === 'Alto' ? 'text-red-400' : a.nivel_risco === 'Medio' ? 'text-amber-400' : 'text-emerald-400'}`}>{a.nivel_risco}</span>
                  <span className="text-xs text-gray-500">{new Date(a.criado_em).toLocaleDateString('pt-BR')}</span>
                </div>
                <p className="text-sm text-gray-300 mt-2">{a.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClienteDetail;
