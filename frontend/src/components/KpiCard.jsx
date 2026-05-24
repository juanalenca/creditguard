import React from 'react';

const KpiCard = ({ title, value, subtitle, icon: Icon, colorClass = "text-blue-600" }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-slate-500 font-medium text-sm">{title}</h3>
        {Icon && <div className={`p-2 bg-slate-50 rounded-lg ${colorClass}`}><Icon className="w-5 h-5" /></div>}
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};

export default KpiCard;
