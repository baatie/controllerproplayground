import React, { useState, useMemo, useEffect } from 'react';
import { BusinessProfile, Client, Expense, Invoice, ProjectBudget } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Invoices from './components/Invoices';
import Expenses from './components/Expenses';
import Budgeting from './components/Budgeting';
import Settings from './components/Settings';
import Customers from './components/Customers';
import LiveAssistant from './components/LiveAssistant';
import { initialBusinesses, Icons } from './constants';
import { api } from './src/services/api';

const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [fade, setFade] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setFade(true), 2500);
    const removeTimer = setTimeout(onComplete, 3000);
    return () => { clearTimeout(timer); clearTimeout(removeTimer); };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 bg-oak z-[9999] flex flex-col items-center justify-center wood-texture transition-opacity duration-500 ${fade ? 'opacity-0' : 'opacity-100'}`}>
      <div className="w-32 h-32 md:w-48 md:h-48 relative flex items-center justify-center animate-float mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-purpleheart to-purpleheartdark rounded-[25%] transform rotate-45 shadow-2xl border-2 border-oaklight/30 animate-slow-spin"></div>
        <span className="relative z-10 text-white font-black text-4xl md:text-6xl tracking-tighter">CP</span>
      </div>
      <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-[0.3em] mb-2 drop-shadow-lg text-center px-4">Controller Pro</h1>
      <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
        <div className="h-full bg-maple animate-[loading_2.5s_ease-in-out_forwards]"></div>
      </div>
      <style>{`@keyframes loading { 0% { width: 0%; } 100% { width: 100%; } }`}</style>
    </div>
  );
};

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { Login } from './src/components/Login';

// ... existing SplashScreen ...

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Core Collections
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [currentBusinessId, setCurrentBusinessId] = useState<string>('');
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<ProjectBudget[]>([]);
  const [view, setView] = useState<'dashboard' | 'invoices' | 'expenses' | 'budgeting' | 'settings' | 'customers'>('dashboard');

  const refreshData = async () => {
    try {
      const [b, c, i, e, bg] = await Promise.all([
        api.businesses.list(),
        api.clients.list(''), // Fetch all
        api.invoices.list(''),
        api.expenses.list(''),
        api.budgets.list('')
      ]);
      setBusinesses(b);
      setClients(c);
      setInvoices(i);
      setExpenses(e);
      setBudgets(bg);

      if (!currentBusinessId && b.length > 0) {
        setCurrentBusinessId(b[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated]);

  const currentBusiness = useMemo(() =>
    businesses.find(b => b.id === currentBusinessId) || businesses[0] || initialBusinesses[0],
    [businesses, currentBusinessId]);

  // Working Sets for Active Context
  const contextData = useMemo(() => ({
    clients: clients.filter(c => c.businessId === currentBusinessId),
    invoices: invoices.filter(i => i.businessId === currentBusinessId),
    expenses: expenses.filter(e => e.businessId === currentBusinessId),
    budgets: budgets.filter(b => b.businessId === currentBusinessId),
  }), [clients, invoices, expenses, budgets, currentBusinessId]);

  // Handlers
  const handleAddBusiness = async (data: BusinessProfile) => {
    await api.businesses.create(data);
    refreshData();
    setCurrentBusinessId(data.id);
    setView('dashboard');
  };

  const handleUpdateBusiness = async (data: BusinessProfile) => {
    await api.businesses.update(data.id, data);
    refreshData();
  };

  const handleDeleteBusiness = async (id: string) => {
    if (businesses.length <= 1) return alert("System requires at least one active profile.");
    if (window.confirm("FATAL: Deleting an entity will purge ALL associated data for this business. Continue?")) {
      await api.businesses.delete(id);
      refreshData();
      if (currentBusinessId === id) setCurrentBusinessId(businesses.find(b => b.id !== id)?.id || '');
    }
  };

  // Invoices
  const handleAddInvoice = async (inv: Invoice) => { await api.invoices.create(inv); refreshData(); };
  const handleUpdateInvoice = async (inv: Invoice) => { await api.invoices.update(inv.id, inv); refreshData(); };
  const handleDeleteInvoice = async (id: string) => { await api.invoices.delete(id); refreshData(); };

  // Expenses
  const handleAddExpense = async (exp: Expense) => { await api.expenses.create(exp); refreshData(); };
  const handleUpdateExpense = async (exp: Expense) => {
    await api.expenses.delete(exp.id);
    await api.expenses.create(exp);
    refreshData();
  };
  const handleDeleteExpense = async (id: string) => { await api.expenses.delete(id); refreshData(); };

  // Budgets
  const handleAddBudget = async (bg: ProjectBudget) => { await api.budgets.create(bg); refreshData(); };
  const handleUpdateBudget = async (bg: ProjectBudget) => { await api.budgets.update(bg.id, bg); refreshData(); };
  const handleDeleteBudget = async (id: string) => { await api.budgets.delete(id); refreshData(); };

  // Clients
  const handleAddClient = async (c: Client) => { await api.clients.create(c); refreshData(); };
  const handleUpdateClient = async (c: Client) => {
    await api.clients.delete(c.id);
    await api.clients.create(c);
    refreshData();
  };
  const handleDeleteClient = async (id: string) => { await api.clients.delete(id); refreshData(); };

  if (showSplash) return <SplashScreen onComplete={() => setShowSplash(false)} />;

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-maple overflow-hidden wood-texture relative">
      <Sidebar view={view} setView={(v) => { setView(v); setIsSidebarOpen(false); }} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {isSidebarOpen && <div className="fixed inset-0 bg-oak/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 bg-white border-b border-oak/20 flex items-center justify-between px-4 md:px-8 shrink-0 shadow-sm z-10">
          <div className="flex items-center space-x-6">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-oak hover:bg-maple/50 rounded-lg"><Icons.Dashboard /></button>
            <div className="flex flex-col">
              <label className="text-[8px] font-black text-oaklight uppercase tracking-widest leading-none mb-1">Active Ledger</label>
              <select
                value={currentBusinessId}
                onChange={(e) => setCurrentBusinessId(e.target.value)}
                className="bg-maple/30 border border-oak/20 text-oak font-bold rounded-lg px-3 py-1 outline-none focus:ring-2 focus:ring-purpleheart text-xs md:text-sm cursor-pointer"
              >
                {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <LiveAssistant businessContext={currentBusiness} />
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-oak leading-none">{currentBusiness.name}</p>
                <p className="text-[9px] text-slate-400 font-medium uppercase tracking-widest">Active Portfolio</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-oak flex items-center justify-center text-maple font-bold border-2 border-oaklight shadow-inner">
                {currentBusiness.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 no-print">
          {view === 'dashboard' && <Dashboard invoices={contextData.invoices} expenses={contextData.expenses} budgets={contextData.budgets} business={currentBusiness} />}
          {view === 'invoices' && (
            <Invoices
              invoices={contextData.invoices}
              allInvoices={invoices}
              clients={contextData.clients}
              business={currentBusiness}
              onAddInvoice={handleAddInvoice}
              onUpdateInvoice={handleUpdateInvoice}
              onDeleteInvoice={handleDeleteInvoice}
              allExpenses={expenses}
            />
          )}
          {view === 'expenses' && (
            <Expenses
              expenses={contextData.expenses}
              allExpenses={expenses}
              categories={currentBusiness.expenseCategories}
              business={currentBusiness}
              onAddExpense={handleAddExpense}
              onUpdateExpense={handleUpdateExpense}
              onDeleteExpense={handleDeleteExpense}
              projects={contextData.budgets}
              invoices={contextData.invoices}
            />
          )}
          {view === 'budgeting' && (
            <Budgeting
              budgets={contextData.budgets}
              allBudgets={budgets}
              business={currentBusiness}
              onAddBudget={handleAddBudget}
              onUpdateBudget={handleUpdateBudget}
              onDeleteBudget={handleDeleteBudget}
            />
          )}
          {view === 'customers' && (
            <Customers
              clients={contextData.clients}
              allClients={clients}
              onAddClient={handleAddClient}
              onUpdateClient={handleUpdateClient}
              onDeleteClient={handleDeleteClient}
              allInvoices={invoices}
              business={currentBusiness}
            />
          )}
          {view === 'settings' && (
            <Settings
              business={currentBusiness}
              businesses={businesses}
              onUpdateBusiness={handleUpdateBusiness}
              onAddBusiness={handleAddBusiness}
              onDeleteBusiness={handleDeleteBusiness}
              onRestoreVault={() => alert("Legacy vault restore not supported in API mode.")}
              onRestoreEntity={() => alert("Legacy entity restore not supported in API mode.")}
              onFreshStart={() => { if (window.confirm("Disconnect?")) window.location.reload(); }}
              contextData={contextData}
              allData={{ businesses, clients, invoices, expenses, budgets, currentBusinessId }}
            />
          )}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
