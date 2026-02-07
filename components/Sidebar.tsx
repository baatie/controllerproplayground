
import React from 'react';
import { Icons } from '../constants';

const Logo = () => (
  <div className="w-10 h-10 md:w-12 md:h-12 relative flex items-center justify-center">
    <div className="absolute inset-0 bg-gradient-to-br from-purpleheart to-purpleheartdark rounded-xl transform rotate-12 shadow-lg border border-white/20"></div>
    <span className="relative z-10 text-white font-black text-xl md:text-2xl tracking-tighter">CP</span>
  </div>
);

interface SidebarProps {
  view: string;
  setView: (view: any) => void;
  isOpen: boolean;
  onClose: () => void;
}

import { useAuth } from '../src/context/AuthContext';

// ... (Logo component remains same)

const Sidebar: React.FC<SidebarProps> = ({ view, setView, isOpen, onClose }) => {
  const { logout } = useAuth();

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-oak text-maple flex flex-col h-full shrink-0 wood-texture border-r border-oaklight/30 shadow-xl transition-transform duration-300 transform 
      lg:relative lg:translate-x-0 
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="p-6 md:p-8 border-b border-oaklight/30 bg-oaklight/10 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Logo />
          <div>
            <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tighter drop-shadow-md leading-none">Controller Pro</h2>
            <p className="text-[8px] md:text-[9px] font-bold text-mapledark mt-1 opacity-80 tracking-widest">FINANCE ENGINE</p>
          </div>
        </div>
        {/* Close button on mobile */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" /></svg>
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-4">
        <NavItem active={view === 'dashboard'} onClick={() => setView('dashboard')} icon={<Icons.Dashboard />} label="Dashboard" />
        <NavItem active={view === 'invoices'} onClick={() => setView('invoices')} icon={<Icons.Invoices />} label="Invoices" />
        <NavItem active={view === 'expenses'} onClick={() => setView('expenses')} icon={<Icons.Expenses />} label="Expenses" />
        <NavItem active={view === 'budgeting'} onClick={() => setView('budgeting')} icon={<Icons.Budgets />} label="Project Budgets" />
        <NavItem active={view === 'customers'} onClick={() => setView('customers')} icon={<Icons.Customers />} label="Customers" />
        <NavItem active={view === 'settings'} onClick={() => setView('settings')} icon={<Icons.Settings />} label="Settings" />

        <div className="pt-4 mt-4 border-t border-oaklight/20">
          <NavItem active={false} onClick={logout} icon={<Icons.Logout />} label="Log Out" />
        </div>
      </nav>

      <div className="p-4 md:p-6 border-t border-oaklight/30 bg-oaklight/5">
        <div className="flex items-center space-x-3 p-3 bg-oaklight/10 rounded-xl border border-white/5">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-mapledark">Real-Time Core Active</span>
        </div>
      </div>
    </aside>
  );
};

const NavItem = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-4 px-4 md:px-5 py-3 md:py-3.5 rounded-xl transition-all duration-300 group ${active
        ? 'bg-purpleheart text-white shadow-[0_4px_20px_rgba(106,13,173,0.3)] scale-[1.03] z-10'
        : 'hover:bg-oaklight/40 text-maple hover:text-white'
      }`}
  >
    <span className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:translate-x-1'}`}>
      {icon}
    </span>
    <span className="font-bold tracking-tight text-xs md:text-sm uppercase">{label}</span>
  </button>
);

export default Sidebar;
