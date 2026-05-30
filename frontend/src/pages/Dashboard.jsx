import { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { AlertCircle, TrendingUp, Clock, DollarSign, Download } from 'lucide-react';
import KpiCard from '../components/KpiCard';
import { exportToCsv } from '../utils/exportCsv';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [tendencias, setTendencias] = useState(null);
  const [evolucao, setEvolucao] = useState([]);
  const [riscoRegional, setRiscoRegional] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kpiRes, trendRes, evoRes, riscoRes, alertasRes] = await Promise.all([
          axios.get(`${API}/kpis`, { headers }),
          axios.get(`${API}/tendencias`, { headers }).catch(() => ({ data: null })),
          axios.get(`${API}/dashboard/evolucao`, { headers }),
          axios.get(`${API}/dashboard/risco-regional`, { headers }),
          axios.get(`${API}/alertas?limit=5`, { headers })
        ]);

        setKpis(kpiRes.data);
        setTendencias(trendRes.data);
        setEvolucao(evoRes.data);
        setRiscoRegional(riscoRes.data);
        setAlertas(alertasRes.data.data || []);
      } catch (err) {
        console.error("Erro ao carregar dados", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleExportKpis = () => {
    if (!kpis) return;
    exportToCsv([{
      'Inadimplência Total': kpis.inadimplencia_total,
      'Recuperação no Mês': kpis.recuperacao_mes,
      'Atraso Médio (dias)': Number(kpis.atraso_medio).toFixed(1),
      'Clientes Críticos': kpis.clientes_criticos
    }], 'kpis_creditguard.csv');
  };

  const formatTrend = (key) => {
    if (!tendencias || !tendencias[key]) return {};
    const t = tendencias[key];
    const val = Number(t.variacao_pct);
    
    if (val === 0) {
      return { trend: 'neutral', trendValue: 'Sem variação no período' };
    }
    
    return {
      trend: val > 0 ? 'up' : 'down',
      trendValue: `${val > 0 ? '+' : ''}${val.toFixed(1)}% vs mês anterior`
    };
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-xl font-semibold text-gray-400 animate-pulse">Carregando painel executivo...</div>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Visão Geral - KPIs</h2>
          <p className="text-gray-400 mt-1">Métricas de risco de crédito e recuperação</p>
        </div>
        <button
          onClick={handleExportKpis}
          className="flex items-center px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors w-full sm:w-auto justify-center"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar KPIs
        </button>
      </div>

      {/* Cards de KPI com tendências */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Inadimplência Total"
          value={`R$ ${Number(kpis?.inadimplencia_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={AlertCircle}
          colorClass="text-red-400 border-red-500/30"
          borderClass="border-red-500"
          {...formatTrend('inadimplencia')}
        />
        <KpiCard
          title="Recuperação no Mês"
          value={`R$ ${Number(kpis?.recuperacao_mes || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          colorClass="text-emerald-400 border-emerald-500/30"
          borderClass="border-emerald-500"
          invertTrendColor={true}
          {...formatTrend('recuperacao')}
        />
        <KpiCard
          title="Atraso Médio"
          value={`${Number(kpis?.atraso_medio || 0).toFixed(1)} dias`}
          icon={Clock}
          colorClass="text-amber-400 border-amber-500/30"
          borderClass="border-amber-500"
          {...formatTrend('atraso_medio')}
        />
        <KpiCard
          title="Clientes Críticos"
          value={kpis?.clientes_criticos || 0}
          icon={TrendingUp}
          colorClass="text-purple-400 border-purple-500/30"
          borderClass="border-purple-500"
          {...formatTrend('novos_alertas')}
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <h3 className="text-lg font-bold text-gray-200 mb-6">Evolução de Inadimplência (Últimos 6 meses)</h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolucao}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="mes" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" tickFormatter={(v) => v >= 1000000 ? `R$${(v / 1000000).toFixed(1)}M` : `R$${(v / 1000).toFixed(0)}K`} fontSize={12} />
                <RechartsTooltip
                  formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Inadimplência']}
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: 8 }}
                  itemStyle={{ color: '#e5e7eb' }}
                  labelStyle={{ color: '#9ca3af' }}
                />
                <Legend />
                <Line type="monotone" dataKey="total" name="Valor (R$)" stroke="#ef4444" strokeWidth={3} dot={{ r: 5, fill: '#ef4444', stroke: '#1f2937', strokeWidth: 2 }} activeDot={{ r: 8, stroke: '#ef4444', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <h3 className="text-lg font-bold text-gray-200 mb-6">Risco Regional (Inadimplência por Região)</h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riscoRegional} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" domain={[0, 8000000]} ticks={[0, 2000000, 4000000, 6000000, 8000000]} tickFormatter={(v) => v >= 1000000 ? `R$${(v / 1000000).toFixed(1)}M` : `R$${(v / 1000).toFixed(0)}K`} fontSize={12} />
                <YAxis type="category" dataKey="regiao" stroke="#9ca3af" width={90} fontSize={12} />
                <RechartsTooltip
                  formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Inadimplência']}
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: 8 }}
                  itemStyle={{ color: '#e5e7eb' }}
                  labelStyle={{ color: '#9ca3af' }}
                  cursor={{ fill: '#374151' }}
                />
                <Bar dataKey="total" name="Inadimplência (R$)" fill="#a855f7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabela de Alertas */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
        <h3 className="text-lg font-bold text-gray-200 mb-4">Últimos Alertas de Risco</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contrato</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Nível</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {alertas.map((alerta) => (
                <tr key={alerta.id} className="hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-purple-400">{alerta.id_contrato}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${alerta.nivel_risco === 'Alto' ? 'bg-red-900/50 text-red-400 border-red-800' : alerta.nivel_risco === 'Medio' ? 'bg-amber-900/50 text-amber-400 border-amber-800' : 'bg-emerald-900/50 text-emerald-400 border-emerald-800'}`}>
                      {alerta.nivel_risco}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">{alerta.descricao}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(alerta.criado_em).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
