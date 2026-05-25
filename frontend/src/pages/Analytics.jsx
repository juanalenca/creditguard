import { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { Lightbulb, Award, TrendingUp, TrendingDown, BarChart3, ShieldAlert, RefreshCw, DollarSign, Download } from 'lucide-react';
import { exportToCsv } from '../utils/exportCsv';

const API = 'http://localhost:5000/api';
const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];

const Analytics = () => {
  const [insights, setInsights] = useState([]);
  const [kpisAvancados, setKpisAvancados] = useState(null);
  const [evolucao, setEvolucao] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

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
  }, []);

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
      case 'concentracao': return 'border-blue-500 bg-blue-900/20 text-blue-400';
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center">
            <Lightbulb className="w-8 h-8 mr-3 text-amber-400" />
            Central de Inteligência
          </h2>
          <p className="text-gray-400 mt-1">Insights automáticos, KPIs derivativos e análise comportamental</p>
        </div>
        <button
          onClick={handleExportInsights}
          className="flex items-center px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
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
            <div key={idx} className={`p-5 rounded-xl border-l-4 bg-gray-800 border border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 ${getInsightColor(insight.tipo)}`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getInsightColor(insight.tipo)}`}>
                  {getInsightIcon(insight.tipo)}
                </div>
                <p className="text-sm text-gray-200 leading-relaxed flex-1">
                  {insight.texto}
                </p>
              </div>
            </div>
          ))}
          {insights.length === 0 && (
            <div className="col-span-3 p-8 bg-gray-800 rounded-xl border border-gray-700 text-center text-gray-500">
              Nenhum insight disponível. Verifique se os dados estão populados no banco.
            </div>
          )}
        </div>
      </div>

      {/* KPIs Derivativos */}
      {kpisAvancados && (
        <div>
          <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-blue-400" />
            KPIs Derivativos Executivos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 border-t-4 border-t-emerald-500">
              <p className="text-xs font-medium text-gray-400 uppercase">Taxa de Recuperação</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{Number(kpisAvancados.taxa_recuperacao || 0).toFixed(1)}%</p>
            </div>
            <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 border-t-4 border-t-amber-500">
              <p className="text-xs font-medium text-gray-400 uppercase">Clientes Reincidentes</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{kpisAvancados.clientes_reincidentes || 0}</p>
            </div>
            <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 border-t-4 border-t-red-500">
              <p className="text-xs font-medium text-gray-400 uppercase">Contratos em Risco</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{kpisAvancados.contratos_em_risco || 0}</p>
            </div>
            <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 border-t-4 border-t-blue-500">
              <p className="text-xs font-medium text-gray-400 uppercase">Variação Mensal</p>
              <p className={`text-2xl font-bold mt-1 flex items-center ${Number(kpisAvancados.variacao_mensal) > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {Number(kpisAvancados.variacao_mensal) > 0 ? <TrendingUp className="w-5 h-5 mr-1" /> : <TrendingDown className="w-5 h-5 mr-1" />}
                {Number(kpisAvancados.variacao_mensal || 0).toFixed(1)}%
              </p>
            </div>
            <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 border-t-4 border-t-purple-500">
              <p className="text-xs font-medium text-gray-400 uppercase">Regiões Monitoradas</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">{kpisAvancados.inadimplencia_por_regiao?.length || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Gráficos Analíticos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inadimplência por Região (Pie) */}
        {kpisAvancados?.inadimplencia_por_regiao && (
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
            <h3 className="text-lg font-bold text-gray-200 mb-6">Distribuição de Inadimplência por Região</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={kpisAvancados.inadimplencia_por_regiao}
                    dataKey="total"
                    nameKey="regiao"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={true}
                  >
                    {kpisAvancados.inadimplencia_por_regiao.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: 8 }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tendência Temporal */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <h3 className="text-lg font-bold text-gray-200 mb-6">Tendência de Inadimplência</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolucao}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="mes" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} fontSize={12} />
                <RechartsTooltip
                  formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: 8 }}
                />
                <Line type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 5, fill: '#8b5cf6' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Ranking Regional */}
      {kpisAvancados?.inadimplencia_por_regiao && (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-amber-400" />
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
                        className={`h-full rounded-full transition-all duration-500 ${idx === 0 ? 'bg-red-500' : idx === 1 ? 'bg-amber-500' : 'bg-blue-500'}`}
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
