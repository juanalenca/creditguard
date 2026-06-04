import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Users, AlertTriangle, Brain, X } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const closeSidebar = () => setIsOpen(false);

  const navClass = ({ isActive }) =>
    `flex items-center w-full p-3 rounded-lg transition-all duration-200 ${
      isActive
        ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50'
        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    }`;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={closeSidebar}
        />
      )}

      <aside 
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex flex-col items-center justify-center w-full">
            <img src="/logo-projeto.png" alt="CreditGuard AI" className="h-36 w-auto object-contain mb-2" />
          </div>
          <button onClick={closeSidebar} className="md:hidden text-gray-400 hover:text-white absolute right-4 top-4">
            <X className="w-6 h-6" />
          </button>
        </div>
      <nav className="flex-1 p-4 space-y-3">
        <NavLink to="/" end onClick={closeSidebar} className={navClass}>
          <LayoutDashboard className="w-5 h-5 mr-3" />
          <span className="font-medium">Dashboard</span>
        </NavLink>
        <NavLink to="/clientes" onClick={closeSidebar} className={navClass}>
          <Users className="w-5 h-5 mr-3" />
          <span className="font-medium">Clientes</span>
        </NavLink>
        <NavLink to="/alertas" onClick={closeSidebar} className={navClass}>
          <AlertTriangle className="w-5 h-5 mr-3" />
          <span className="font-medium">Alertas</span>
        </NavLink>
        <NavLink to="/analytics" onClick={closeSidebar} className={navClass}>
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
    </>
  );
};

export default Sidebar;
