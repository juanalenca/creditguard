import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Users, AlertTriangle, ShieldCheck, Brain } from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navClass = ({ isActive }) =>
    `flex items-center w-full p-3 rounded-lg transition-all duration-200 ${
      isActive
        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    }`;

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-800 flex flex-col items-center justify-center">
        <ShieldCheck className="w-10 h-10 text-blue-500 mb-2" />
        <h1 className="text-xl font-bold text-white tracking-wide">CreditGuard<span className="text-blue-500"> AI</span></h1>
      </div>
      <nav className="flex-1 p-4 space-y-3">
        <NavLink to="/" end className={navClass}>
          <LayoutDashboard className="w-5 h-5 mr-3" />
          <span className="font-medium">Dashboard</span>
        </NavLink>
        <NavLink to="/clientes" className={navClass}>
          <Users className="w-5 h-5 mr-3" />
          <span className="font-medium">Clientes</span>
        </NavLink>
        <NavLink to="/alertas" className={navClass}>
          <AlertTriangle className="w-5 h-5 mr-3" />
          <span className="font-medium">Alertas</span>
        </NavLink>
        <NavLink to="/analytics" className={navClass}>
          <Brain className="w-5 h-5 mr-3" />
          <span className="font-medium">Inteligência</span>
        </NavLink>
      </nav>
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center w-full p-3 text-red-400 hover:bg-gray-800 hover:text-red-300 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
