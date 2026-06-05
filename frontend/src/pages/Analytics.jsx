import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Lightbulb, Award, TrendingUp, TrendingDown, BarChart3, ShieldAlert, RefreshCw, DollarSign, Download } from 'lucide-react';
import { exportToCsv } from '../utils/exportCsv';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const COLORS = ['#ef4444', '#f59e0b', '#a855f7', '#10b981', '#8b5cf6', '#ec4899'];

const Analytics = () => {
  const [insights, setInsights] = useState([]);
  const [kpisAvancados, setKpisAvancados] = useState(null);
  const [evolucao, setEvolucao] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [insightsRes, kpisRes, evoRes] = await Promise.all([
          axios.get(`${API}/insights`, { headers }).catch(() => ({ data: [] })),
          axios.get(`${API}/kpis/avancados`, { headers }).catch(() => ({ data: null })),
          axios.get(`${API}/dashboard/evolucao`, { headers })
        ]);

        setInsights(insightsRes.data);
        setKpisAvancados(kpisRes.data);
        setEvolucao(evoRes.data);
      } catch (err) {
        console.error("Erro ao carregar analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [headers]);

  const getInsightIcon = (tipo) => {
    switch (tipo) {
      case 'concentracao': return <BarChart3 className="w-5 h-5" />;
      case 'reincidencia': return <RefreshCw className="w-5 h-5" />;
      case 'crescimento': return <TrendingUp className="w-5 h-5" />;
      case 'critico': return <ShieldAlert className="w-5 h-5" />;
      case 'media': return <DollarSign className="w-5 h-5" />;
      default: return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getInsightColor = (tipo) => {
    switch (tipo) {
      case 'concentracao': return 'border-orange-500 bg-orange-900/20 text-orange-400';
      case 'reincidencia': return 'border-amber-500 bg-amber-900/20 text-amber-400';
      case 'crescimento': return 'border-red-500 bg-red-900/20 text-red-400';
      case 'critico': return 'border-red-500 bg-red-900/20 text-red-400';
      case 'media': return 'border-emerald-500 bg-emerald-900/20 text-emerald-400';
      default: return 'border-purple-500 bg-purple-900/20 text-purple-400';
    }
  };

  const handleExportInsights = () => {
    exportToCsv(insights.map(i => ({ Tipo: i.tipo, Insight: i.texto })), 'insights_creditguard.csv');
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-xl font-semibold text-gray-400 animate-pulse">Processando inteligência analítica...</div>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-400 tracking-tight flex items-center">
            <Lightbulb className="w-8 h-8 mr-3 text-amber-500" />
            Central de Inteligência
          </h2>
          <p className="text-amber-200/60 mt-1 font-medium tracking-wide">Insights automáticos, KPIs derivativos e análise comportamental</p>
        </div>
        <button
          onClick={handleExportInsights}
          className="flex items-center px-5 py-2.5 bg-gray-900/50 backdrop-blur-sm border border-white/10 text-gray-300 rounded-xl hover:bg-white/5 transition-all shadow-lg hover:shadow-amber-500/10 hover:-translate-y-0.5 w-full sm:w-auto justify-center"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar Insights
        </button>
      </div>

      {/* Insights Automáticos */}
      <div>
        <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center">
          <Lightbulb className="w-5 h-5 mr-2 text-amber-400" />
          Insights Gerados Automaticamente
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((insight, idx) => (
            <div key={idx} className={`p-6 rounded-2xl border-l-4 bg-gray-900/40 backdrop-blur-md border border-white/5 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ${getInsightColor(insight.tipo)}`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl shadow-inner ${getInsightColor(insight.tipo).replace('border-', 'bg-').replace('/20', '/30')}`}>
                  {getInsightIcon(insight.tipo)}
                </div>
                <p className="text-sm font-medium text-gray-300 leading-relaxed flex-1 tracking-wide">
                  {insight.texto}
                </p>
              </div>
            </div>
          ))}
          {insights.length === 0 && (
            <div className="col-span-3 p-8 bg-gray-900/40 backdrop-blur-md rounded-2xl border border-white/5 text-center text-gray-500 font-medium">
              Nenhum insight disponível. Verifique se os dados estão populados no banco.
            </div>
          )}
        </div>
      </div>

      {/* KPIs Derivativos */}
      {kpisAvancados && (
        <div>
          <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-purple-400" />
            KPIs Derivativos Executivos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-gray-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 border-t-4 border-t-emerald-500 shadow-lg hover:-translate-y-1 transition-all">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Taxa de Recuperação</p>
              <p className="text-3xl font-bold text-emerald-400 mt-2">{Number(kpisAvancados.taxa_recuperacao || 0).toFixed(1)}%</p>
            </div>
            <div className="bg-gray-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 border-t-4 border-t-amber-500 shadow-lg hover:-translate-y-1 transition-all">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Clientes Reincidentes</p>
              <p className="text-3xl font-bold text-amber-400 mt-2">{kpisAvancados.clientes_reincidentes || 0}</p>
            </div>
            <div className="bg-gray-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 border-t-4 border-t-red-500 shadow-lg hover:-translate-y-1 transition-all">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contratos em Risco</p>
              <p className="text-3xl font-bold text-red-400 mt-2">{kpisAvancados.contratos_em_risco || 0}</p>
            </div>
            <div className="bg-gray-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 border-t-4 border-t-purple-500 shadow-lg hover:-translate-y-1 transition-all">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Variação da Inadimplência</p>
              <p className={`text-3xl font-bold mt-2 flex items-center ${Number(kpisAvancados.variacao_mensal) > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {Number(kpisAvancados.variacao_mensal) > 0 ? <TrendingUp className="w-6 h-6 mr-1" /> : <TrendingDown className="w-6 h-6 mr-1" />}
                {Number(kpisAvancados.variacao_mensal || 0).toFixed(1)}%
              </p>
              <p className="text-[11px] text-gray-500 mt-2 font-medium tracking-wide">Queda = melhoria vs mês anterior</p>
            </div>
            <div className="bg-gray-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 border-t-4 border-t-indigo-500 shadow-lg hover:-translate-y-1 transition-all">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Regiões Monitoradas</p>
              <p className="text-3xl font-bold text-indigo-400 mt-2">{kpisAvancados.inadimplencia_por_regiao?.length || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Gráficos Analíticos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inadimplência por Região (Pie) */}
        {kpisAvancados?.inadimplencia_por_regiao && (
          <div className="bg-gray-900/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-6">Distribuição de Inadimplência por Região</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={kpisAvancados.inadimplencia_por_regiao.map(d => ({...d, total: Number(d.total)}))}
                    dataKey="total"
                    nameKey="regiao"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {kpisAvancados.inadimplencia_por_regiao.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`]}
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#e5e7eb', fontWeight: 600 }}
                    labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tendência Temporal */}
        <div className="bg-gray-900/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-2xl">
          <h3 className="text-lg font-bold text-white mb-6">Tendência de Inadimplência</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolucao}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="mes" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" tickFormatter={(v) => v >= 1000000 ? `R$${(v / 1000000).toFixed(1)}M` : `R$${(v / 1000).toFixed(0)}K`} fontSize={12} />
                <RechartsTooltip
                  formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#e5e7eb', fontWeight: 600 }}
                  labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                />
                <Line type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 5, fill: '#8b5cf6' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Ranking Regional */}
      {kpisAvancados?.inadimplencia_por_regiao && (
        <div className="bg-gray-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/5 shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <Award className="w-6 h-6 mr-3 text-amber-400" />
            Ranking de Inadimplência por Região
          </h3>
          <div className="space-y-3">
            {kpisAvancados.inadimplencia_por_regiao
              .sort((a, b) => Number(b.total) - Number(a.total))
              .map((reg, idx) => {
                const maxVal = Number(kpisAvancados.inadimplencia_por_regiao[0]?.total || 1);
                const pct = (Number(reg.total) / maxVal) * 100;
                return (
                  <div key={reg.regiao} className="flex items-center gap-4">
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${idx === 0 ? 'bg-red-500 text-white' : idx === 1 ? 'bg-amber-500 text-white' : 'bg-gray-700 text-gray-300'}`}>
                      {idx + 1}
                    </span>
                    <span className="w-28 text-sm font-medium text-gray-300">{reg.regiao}</span>
                    <div className="flex-1 bg-gray-900 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${idx === 0 ? 'bg-red-500' : idx === 1 ? 'bg-amber-500' : 'bg-purple-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-200 w-36 text-right">
                      R$ {Number(reg.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
