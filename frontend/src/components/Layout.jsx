import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, ShieldCheck } from 'lucide-react';
import Sidebar from './Sidebar';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden font-sans flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-start gap-4 p-4 bg-gray-900 border-b border-gray-800 z-10">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 -ml-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <img src="/logo-projeto.png" alt="CreditGuard AI" className="h-16 w-auto object-contain" />
        </div>
      </div>

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="flex-1 overflow-auto p-4 sm:p-8 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-gray-950 to-gray-950 -z-10 pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
