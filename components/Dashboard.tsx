
import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Invoice, Expense, ProjectBudget, BusinessProfile } from '../types';
import { getFinancialInsights } from '../services/geminiService';

interface DashboardProps {
  invoices: Invoice[];
  expenses: Expense[];
  budgets: ProjectBudget[];
  business: BusinessProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ invoices, expenses, budgets, business }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  const stats = useMemo(() => {
    const totalIncome = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const pendingIncome = invoices.filter(i => i.status === 'sent').reduce((sum, i) => sum + i.total, 0);
    return { 
      totalIncome: Math.round(totalIncome * 100) / 100, 
      pendingIncome: Math.round(pendingIncome * 100) / 100, 
      totalExpenses: Math.round(totalExpenses * 100) / 100, 
      netProfit: Math.round((totalIncome - totalExpenses) * 100) / 100
    };
  }, [invoices, expenses]);

  const chartData = [
    { name: 'Income', value: stats.totalIncome, color: '#22c55e' },
    { name: 'Expenses', value: stats.totalExpenses, color: '#ef4444' }
  ];

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const context = `Context: ${business.name}. Income: $${stats.totalIncome}. Expenses: $${stats.totalExpenses}. AR: $${stats.pendingIncome}. Projects: ${budgets.length}. Advise on optimization.`;
      setAiInsight(await getFinancialInsights(context));
    } catch (e) { console.error(e); } finally { setIsAnalyzing(false); }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-oak uppercase tracking-tighter leading-none">Financial Snapshot: {business.name}</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Operational Governance</p>
        </div>
        <button onClick={handleRunAnalysis} disabled={isAnalyzing} className="px-6 py-3 bg-purpleheart text-white rounded-xl font-black flex items-center space-x-2 shadow-xl active:scale-95 text-[10px] uppercase tracking-widest disabled:opacity-50">
          {isAnalyzing ? 'Processing Analysis...' : 'Strategic Advisor'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Net Profit (Cash)" amount={stats.netProfit} color="green" />
        <StatCard title="Portfolio Yield" amount={stats.totalIncome} color="blue" />
        <StatCard title="Operational Burn" amount={stats.totalExpenses} color="red" />
        <StatCard title="Accounts Receivable" amount={stats.pendingIncome} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[32px] border border-mapledark">
          <h3 className="text-sm font-black text-oak uppercase tracking-widest border-b border-maple pb-4 mb-6">Capital Flow</h3>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 900}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 900}} />
                <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                  {chartData.map((e, i) => <Cell key={`c-${i}`} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[32px] border border-mapledark">
          <h3 className="text-sm font-black text-oak uppercase tracking-widest border-b border-maple pb-4 mb-6">Nexus Liquidity</h3>
          <div className="space-y-8">
            {budgets.map(b => (
              <div key={b.id} className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-oak truncate mr-2">{b.name}</span>
                  <span>{Math.round((b.spent / b.totalBudget) * 100)}%</span>
                </div>
                <div className="w-full bg-maple h-3 rounded-full overflow-hidden border border-mapledark">
                  <div className={`h-full bg-purpleheart`} style={{ width: `${(b.spent / b.totalBudget) * 100}%` }}></div>
                </div>
                <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>Expended: ${b.spent.toLocaleString()}</span>
                  <span>Cap: ${b.totalBudget.toLocaleString()}</span>
                </div>
              </div>
            ))}
            {budgets.length === 0 && <p className="text-[10px] uppercase text-slate-400 italic text-center py-12">No project budgets defined.</p>}
          </div>
        </div>
      </div>

      {aiInsight && (
        <div className="bg-oak text-maple p-12 rounded-[40px] shadow-2xl wood-texture relative group border-4 border-white/10">
          <h3 className="text-xl font-black mb-6 flex items-center space-x-3 uppercase tracking-tighter">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
            <span>Advisor Insights</span>
          </h3>
          <div className="prose prose-invert max-w-none text-sm font-medium leading-relaxed opacity-90">{aiInsight}</div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, amount, color }: { title: string, amount: number, color: string }) => (
  <div className="bg-white p-8 rounded-[32px] shadow-sm border border-mapledark group hover:border-oak transition-all">
    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 block">{title}</span>
    <div className="text-2xl font-black text-oak tracking-tighter truncate group-hover:scale-105 transition-transform origin-left">
      ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
    </div>
  </div>
);

export default Dashboard;
