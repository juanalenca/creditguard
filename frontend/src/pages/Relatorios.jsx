import React from 'react';
import { FileText, Download } from 'lucide-react';

const Relatorios = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Relatórios Executivos</h2>
        <p className="text-slate-500 text-sm mt-1">Geração de documentos e extrações CSV</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-start gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Inadimplência Mensal</h3>
            <p className="text-sm text-slate-500 mt-1">Resumo detalhado dos clientes com parcelas vencidas neste mês.</p>
          </div>
          <button className="mt-auto flex items-center gap-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors w-full justify-center">
            <Download className="w-4 h-4" /> Baixar PDF
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-start gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Recuperação de Crédito</h3>
            <p className="text-sm text-slate-500 mt-1">Extrato de todas as parcelas vencidas que foram quitadas.</p>
          </div>
          <button className="mt-auto flex items-center gap-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors w-full justify-center">
            <Download className="w-4 h-4" /> Baixar CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default Relatorios;
