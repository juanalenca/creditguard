import React from 'react';
import { Settings, Shield, Bell } from 'lucide-react';

const Configuracoes = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Configurações</h2>
        <p className="text-slate-500 text-sm mt-1">Ajustes da plataforma e regras de risco</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        <div className="p-6 border-b border-slate-100 flex gap-4 items-start">
          <div className="p-3 bg-slate-50 rounded-lg text-slate-600">
            <Settings className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-slate-800">Gerais</h3>
            <p className="text-sm text-slate-500 mb-4">Preferências do sistema.</p>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" defaultChecked />
                <span className="text-sm text-slate-700">Tema Claro Padrão</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" defaultChecked />
                <span className="text-sm text-slate-700">Ocultar valores monetários ao abrir</span>
              </label>
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-slate-100 flex gap-4 items-start">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <Shield className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-slate-800">Regras de Risco Heurístico</h3>
            <p className="text-sm text-slate-500 mb-4">Ajuste dos parâmetros acadêmicos para considerar atraso crítico.</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dias para Risco Médio</label>
                <input type="number" defaultValue="16" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dias para Risco Alto</label>
                <input type="number" defaultValue="61" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 flex justify-end gap-3">
          <button className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors">
            Restaurar Padrões
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            Salvar Configurações
          </button>
        </div>

      </div>
    </div>
  );
};

export default Configuracoes;
