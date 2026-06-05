import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle2, XCircle, Clock, AlertTriangle, Download } from 'lucide-react';
import { exportToCsv } from '../utils/exportCsv';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ClienteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contrato, setContrato] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

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
  }, [id, headers]);

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
      <div className="bg-gray-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/5 shadow-2xl">
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div>
            <h2 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 font-mono tracking-tight">{contrato.id_contrato}</h2>
            <p className="text-gray-400 mt-2">Assessoria: <span className="text-gray-200 font-medium">{contrato.nome_assessoria}</span></p>
            <p className="text-gray-400 mt-1">Região: <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-900/30 text-purple-400 border border-purple-800/50">{contrato.regiao}</span></p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-900/60 p-4 rounded-2xl text-center border border-white/5 shadow-inner">
              <p className="text-xs text-gray-500 uppercase font-semibold">Valor Inadimplente</p>
              <p className="text-xl font-bold text-red-400 mt-1">R$ {Number(contrato.valor_inadimplente).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
            </div>
            <div className="bg-gray-900/60 p-4 rounded-2xl text-center border border-white/5 shadow-inner">
              <p className="text-xs text-gray-500 uppercase font-semibold">Dias Atraso</p>
              <p className={`text-xl font-bold mt-1 ${contrato.dias_atraso_inicial > 60 ? 'text-red-400' : 'text-amber-400'}`}>{contrato.dias_atraso_inicial}d</p>
            </div>
            <div className="bg-gray-900/60 p-4 rounded-2xl text-center border border-white/5 shadow-inner">
              <p className="text-xs text-gray-500 uppercase font-semibold">Score Risco</p>
              <p className="text-xl font-bold text-amber-400 mt-1">{Number(contrato.score_risco).toFixed(0)}</p>
            </div>
            <div className="bg-gray-900/60 p-4 rounded-2xl text-center border border-white/5 shadow-inner">
              <p className="text-xs text-gray-500 uppercase font-semibold">Status</p>
              <p className="text-lg font-bold text-white mt-1">{contrato.status_cobranca}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Resumo de Parcelas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900/40 backdrop-blur-md p-5 rounded-2xl border border-white/5 flex items-center gap-4 shadow-lg hover:-translate-y-1 transition-all">
          <div className="p-3 rounded-2xl bg-purple-900/30 shadow-[0_0_15px_rgba(147,51,234,0.2)]"><FileText className="w-6 h-6 text-purple-400" /></div>
          <div><p className="text-sm font-medium text-gray-400">Total Parcelas</p><p className="text-3xl font-bold text-white">{totalParcelas}</p></div>
        </div>
        <div className="bg-gray-900/40 backdrop-blur-md p-5 rounded-2xl border border-white/5 flex items-center gap-4 shadow-lg hover:-translate-y-1 transition-all">
          <div className="p-3 rounded-2xl bg-emerald-900/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]"><CheckCircle2 className="w-6 h-6 text-emerald-400" /></div>
          <div><p className="text-sm font-medium text-gray-400">Pagas</p><p className="text-3xl font-bold text-emerald-400">{parcelasPagas}</p></div>
        </div>
        <div className="bg-gray-900/40 backdrop-blur-md p-5 rounded-2xl border border-white/5 flex items-center gap-4 shadow-lg hover:-translate-y-1 transition-all">
          <div className="p-3 rounded-2xl bg-red-900/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]"><XCircle className="w-6 h-6 text-red-400" /></div>
          <div><p className="text-sm font-medium text-gray-400">Atrasadas</p><p className="text-3xl font-bold text-red-400">{parcelasAtrasadas}</p></div>
        </div>
      </div>

      {/* Tabela de Parcelas */}
      <div className="bg-gray-900/40 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center"><FileText className="w-5 h-5 mr-3 text-purple-400" /> Histórico de Parcelas</h3>
          <button onClick={handleExportParcelas} className="flex items-center px-4 py-2 bg-gray-900/50 backdrop-blur-sm border border-white/10 text-gray-300 rounded-xl hover:bg-white/5 transition-all shadow-lg text-sm">
            <Download className="w-4 h-4 mr-2" /> CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/5">
            <thead className="bg-white/5">
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
            <tbody className="divide-y divide-white/5">
              {contrato.parcelas?.map((p) => {
                const isAtrasado = !p.data_pagamento && new Date(p.data_vencimento) < new Date();
                const isPago = !!p.data_pagamento;
                return (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
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
        <div className="bg-gray-900/40 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center"><AlertTriangle className="w-5 h-5 mr-3 text-red-500" /> Alertas Emitidos</h3>
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
