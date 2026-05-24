import React, { useEffect, useState } from 'react';
import axios from 'axios';
import KpiCard from '../components/KpiCard';
import { DollarSign, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

const Dashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [evolucao, setEvolucao] = useState([]);
  const [riscoRegional, setRiscoRegional] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kpisRes, evolucaoRes, riscoRes] = await Promise.all([
          axios.get('http://localhost:5000/api/kpis'),
          axios.get('http://localhost:5000/api/dashboard/evolucao'),
          axios.get('http://localhost:5000/api/dashboard/risco-regional')
        ]);
        
        setKpis(kpisRes.data);
        setEvolucao(evolucaoRes.data.map(item => ({...item, total: parseFloat(item.total)})));
        setRiscoRegional(riscoRes.data.map(item => ({...item, total: parseFloat(item.total)})));
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center">Carregando dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard Executivo</h2>
          <p className="text-slate-500 text-sm mt-1">Visão geral da carteira de crédito e recuperação</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="Inadimplência Total" 
          value={formatCurrency(kpis?.inadimplencia_total || 0)} 
          subtitle="Parcelas vencidas em aberto"
          icon={DollarSign}
          colorClass="text-red-500"
        />
        <KpiCard 
          title="Recuperação no Mês" 
          value={formatCurrency(kpis?.recuperacao_mes || 0)} 
          subtitle="Atrasados pagos neste mês"
          icon={TrendingUp}
          colorClass="text-emerald-500"
        />
        <KpiCard 
          title="Atraso Médio" 
          value={`${Math.round(kpis?.atraso_medio || 0)} dias`} 
          subtitle="Média das parcelas abertas"
          icon={Clock}
          colorClass="text-yellow-500"
        />
        <KpiCard 
          title="Clientes Críticos" 
          value={kpis?.clientes_criticos || 0} 
          subtitle="Alerta de risco gerado"
          icon={AlertCircle}
          colorClass="text-red-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico Temporal */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Tendência Temporal de Inadimplência</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolucao} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(val) => `R$${(val/1000)}k`} />
                <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico Risco Regional */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Risco Regional (Inadimplência por Cidade)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riscoRegional.slice(0, 5)} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(val) => `R$${(val/1000)}k`} />
                <YAxis dataKey="cidade" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} width={100} />
                <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="total" fill="#f43f5e" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
