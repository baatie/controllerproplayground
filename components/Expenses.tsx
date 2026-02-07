
import React, { useState, useRef, useEffect } from 'react';
import { Expense, BusinessProfile, ProjectBudget, Invoice } from '../types';
import { searchMarketTrends } from '../services/geminiService';
import * as ReactToPrint from 'react-to-print';

interface ExpensesProps {
  expenses: Expense[];
  allExpenses: Expense[];
  categories: string[];
  business: BusinessProfile;
  onAddExpense: (expense: Expense) => void;
  onUpdateExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  projects: ProjectBudget[];
  invoices: Invoice[];
}

const Expenses: React.FC<ExpensesProps> = ({ expenses, allExpenses, categories, business, onAddExpense, onUpdateExpense, onDeleteExpense, projects, invoices }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<Expense | null>(null);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    category: categories[0] || '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    description: '',
    projectId: '',
    invoiceId: ''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [marketInsights, setMarketInsights] = useState<{ text: string, sources: any[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const useReactToPrintHook = (ReactToPrint as any).useReactToPrint || (ReactToPrint as any).default?.useReactToPrint;

  const receiptPrintRef = useRef<HTMLDivElement>(null);
  const handlePrintReceipt = useReactToPrintHook ? useReactToPrintHook({
    contentRef: receiptPrintRef,
  }) : () => window.print();

  // Reset category if categories list changes and current selection is gone
  useEffect(() => {
    if (newExpense.category && !categories.includes(newExpense.category)) {
      setNewExpense(prev => ({ ...prev, category: categories[0] || '' }));
    }
  }, [categories, newExpense.category]);

  const handleSaveExpense = () => {
    if (!newExpense.amount || !newExpense.vendor) return;
    const expenseData: Expense = {
      id: editingExpenseId || `EXP-${Date.now()}`,
      businessId: business.id,
      category: newExpense.category || categories[0] || 'Uncategorized',
      amount: Math.round(newExpense.amount * 100) / 100,
      date: newExpense.date!,
      description: newExpense.description || '',
      vendor: newExpense.vendor,
      projectId: newExpense.projectId,
      invoiceId: newExpense.invoiceId,
      receiptData: newExpense.receiptData
    };

    if (editingExpenseId) {
      onUpdateExpense(expenseData);
    } else {
      onAddExpense(expenseData);
    }
    setIsAdding(false);
    setEditingExpenseId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Permanently remove this expense entry from the ledger?")) {
      onDeleteExpense(id);
    }
  };

  const startEdit = (exp: Expense) => {
    setEditingExpenseId(exp.id);
    setNewExpense(exp);
    setIsAdding(true);
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewExpense({ ...newExpense, receiptData: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMarketSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const result = await searchMarketTrends(`Current average costs and vendor pricing for ${searchQuery} for businesses in ${business.address}`);
      setMarketInsights(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-oak uppercase tracking-tighter">Expenditure Ledger</h2>
          <p className="text-[10px] md:text-xs font-medium text-slate-500">Cost distribution and audit trail.</p>
        </div>
        <button
          onClick={() => { setEditingExpenseId(null); setNewExpense({ category: categories[0] || '', amount: 0, date: new Date().toISOString().split('T')[0], vendor: '', description: '', projectId: '', invoiceId: '' }); setIsAdding(true); }}
          className="w-full md:w-auto bg-purpleheart text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-purpleheartdark transition-all shadow-[0_4px_15px_rgba(106,13,173,0.3)] hover:scale-105 active:scale-95"
        >
          Authorize Expense
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-mapledark overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead className="bg-maple border-b border-mapledark">
                  <tr>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-[9px] md:text-[10px] font-black text-oak uppercase tracking-widest">Date</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-[9px] md:text-[10px] font-black text-oak uppercase tracking-widest">Vendor</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-[9px] md:text-[10px] font-black text-oak uppercase tracking-widest">Nexus</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-[9px] md:text-[10px] font-black text-oak uppercase tracking-widest">Receipt</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-[9px] md:text-[10px] font-black text-oak uppercase tracking-widest text-right">Amount</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-[9px] md:text-[10px] font-black text-oak uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-maple">
                  {expenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-maple/20 transition-colors group">
                      <td className="px-4 md:px-6 py-3 md:py-4 text-slate-500 text-[10px] md:text-sm font-bold">{exp.date}</td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <div className="flex flex-col">
                          <span className="font-black text-oak text-[10px] md:text-sm">{exp.vendor}</span>
                          <span className="text-[8px] md:text-[9px] uppercase font-black text-purpleheart tracking-widest opacity-60">{exp.category}</span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <div className="flex flex-col text-[8px] md:text-[10px] space-y-1 font-bold">
                          {exp.projectId && (
                            <span className="px-2 py-0.5 bg-oak/10 text-oak border border-oak/20 rounded-lg truncate max-w-[120px]">
                              {projects.find(p => p.id === exp.projectId)?.name}
                            </span>
                          )}
                          {exp.invoiceId && (
                            <span className="px-2 py-0.5 bg-purpleheart/10 text-purpleheart border border-purpleheart/20 rounded-lg">
                              Bill: {exp.invoiceId}
                            </span>
                          )}
                          {!exp.projectId && !exp.invoiceId && <span className="text-slate-400 italic font-medium">Overhead</span>}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        {exp.receiptData ? (
                          <button
                            onClick={() => setSelectedReceipt(exp)}
                            className="flex items-center space-x-2 text-green-600 font-black text-[8px] md:text-[10px] uppercase tracking-widest bg-green-50 px-2 py-1 rounded-lg border border-green-200"
                          >
                            <span>Audit</span>
                          </button>
                        ) : (
                          <span className="text-red-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-40">Missing</span>
                        )}
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4 text-right font-black text-oak text-[10px] md:text-sm">${formatCurrency(exp.amount)}</td>
                      <td className="px-4 md:px-6 py-3 md:py-4 text-right space-x-2 md:space-x-3">
                        <button onClick={() => startEdit(exp)} className="text-purpleheart hover:text-purpleheartdark text-[9px] md:text-[10px] font-black uppercase tracking-widest">Edit</button>
                        <button onClick={() => handleDelete(exp.id)} className="text-red-400 hover:text-red-600 p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium italic">No expenses recorded for this profile.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-oak rounded-2xl md:rounded-[32px] p-6 md:p-8 text-maple shadow-xl wood-texture border-2 border-white/10">
            <h3 className="text-base md:text-lg font-black mb-4 flex items-center space-x-3">
              <div className="p-2 bg-white/10 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
              </div>
              <span>Market Audit</span>
            </h3>
            <p className="text-[10px] md:text-xs text-mapledark mb-6 italic leading-relaxed">Benchmark regional procurement costs.</p>
            <div className="space-y-4">
              <input
                placeholder="Ex: Industrial Rack"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 border-2 border-white/10 rounded-xl md:rounded-2xl px-4 md:px-5 py-2.5 md:py-3 text-xs md:text-sm focus:bg-white/20 outline-none transition-all placeholder:text-maple/40 font-bold"
              />
              <button
                onClick={handleMarketSearch}
                disabled={isSearching}
                className="w-full bg-purpleheart text-white py-3 md:py-4 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
              >
                {isSearching ? 'Auditing...' : 'Compliance Check'}
              </button>
            </div>

            {marketInsights && (
              <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-white/10 space-y-4">
                <div className="text-[11px] md:text-xs leading-relaxed text-maple font-medium">
                  {marketInsights.text}
                </div>
                {marketInsights.sources.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-mapledark">Sources</p>
                    {marketInsights.sources.map((src, i) => (
                      <a key={i} href={src.web?.uri} target="_blank" rel="noopener noreferrer" className="block text-[9px] md:text-[10px] text-purpleheart/40 bg-white/5 p-2 rounded-xl hover:bg-white/10 truncate transition-colors border border-white/5">
                        {src.web?.title || src.web?.uri}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-oak/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4">
          <div className="bg-white rounded-[32px] md:rounded-[40px] w-full max-w-lg overflow-hidden flex flex-col shadow-2xl border-4 border-white max-h-[95vh]">
            <div className="p-6 md:p-8 bg-oak text-white flex justify-between items-center wood-texture shrink-0">
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter">{editingExpenseId ? 'Modify Entry' : 'New Expenditure'}</h3>
              <button onClick={() => setIsAdding(false)} className="text-maple hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>
            </div>
            <div className="p-6 md:p-10 space-y-6 md:space-y-8 overflow-y-auto bg-maple/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vendor</label>
                  <input
                    value={newExpense.vendor}
                    onChange={e => setNewExpense({ ...newExpense, vendor: e.target.value })}
                    className="w-full border-2 border-maple rounded-xl md:rounded-2xl px-4 md:px-5 py-2.5 md:py-4 text-sm font-black text-oak focus:ring-4 focus:ring-purpleheart/10 outline-none"
                  />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newExpense.amount}
                    onChange={e => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full border-2 border-maple rounded-xl md:rounded-2xl px-4 md:px-5 py-2.5 md:py-4 text-sm font-black text-purpleheart focus:ring-4 focus:ring-purpleheart/10 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">GL Category</label>
                  <select
                    value={newExpense.category}
                    onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                    className="w-full border-2 border-maple rounded-xl md:rounded-2xl px-4 md:px-5 py-2.5 md:py-4 text-sm font-bold text-oak outline-none"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                  <input
                    type="date"
                    value={newExpense.date}
                    onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                    className="w-full border-2 border-maple rounded-xl md:rounded-2xl px-4 md:px-5 py-2.5 md:py-4 text-sm font-bold text-oak outline-none"
                  />
                </div>
              </div>

              <div className="bg-maple/20 p-5 md:p-8 rounded-2xl md:rounded-[32px] border-2 border-mapledark/30 space-y-4 md:space-y-6">
                <h4 className="text-[8px] md:text-[10px] font-black text-oaklight uppercase tracking-[0.2em] text-center border-b border-mapledark/50 pb-2 md:pb-3">Financial Nexus</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Project</label>
                    <select
                      value={newExpense.projectId}
                      onChange={e => setNewExpense({ ...newExpense, projectId: e.target.value })}
                      className="w-full border-2 border-mapledark/50 rounded-xl md:rounded-2xl px-3 md:px-4 py-2 md:py-3 text-[10px] md:text-xs font-bold text-oak"
                    >
                      <option value="">General Overhead</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Billable</label>
                    <select
                      value={newExpense.invoiceId}
                      onChange={e => setNewExpense({ ...newExpense, invoiceId: e.target.value })}
                      className="w-full border-2 border-mapledark/50 rounded-xl md:rounded-2xl px-3 md:px-4 py-2 md:py-3 text-[10px] md:text-xs font-bold text-oak"
                    >
                      <option value="">Non-Billable</option>
                      {invoices.map(i => <option key={i.id} value={i.id}>{i.id}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 md:space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Receipt Artifact</label>
                <div className="flex flex-col md:flex-row items-center md:items-center space-y-3 md:space-y-0 md:space-x-6 bg-white p-4 md:p-6 rounded-2xl md:rounded-[32px] border-2 border-dashed border-mapledark/50">
                  <label className="w-full md:w-auto text-center cursor-pointer bg-purpleheart/10 text-purpleheart border-2 border-purpleheart/20 px-6 py-2 md:py-3 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-purpleheart hover:text-white transition-all">
                    Upload Scan
                    <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleReceiptUpload} />
                  </label>
                  {newExpense.receiptData ? (
                    <div className="flex items-center space-x-2 text-green-600 font-black text-[9px] md:text-[10px] uppercase">
                      <span>Captured</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-[8px] md:text-[9px] font-medium uppercase tracking-widest italic text-center">Pending scan...</span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 md:space-y-2 pb-4">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Controller Memo</label>
                <textarea
                  value={newExpense.description}
                  onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="w-full border-2 border-maple rounded-2xl md:rounded-3xl px-4 md:px-6 py-3 md:py-4 outline-none focus:ring-4 focus:ring-purpleheart/10 text-xs md:text-sm font-medium text-oak"
                  rows={2}
                  placeholder="Audit context..."
                />
              </div>
            </div>
            <div className="p-6 md:p-10 border-t-2 border-maple flex flex-col-reverse md:flex-row justify-end gap-3 md:gap-6 bg-white shrink-0">
              <button onClick={() => setIsAdding(false)} className="w-full md:w-auto px-8 py-2 md:py-3 text-oak font-black uppercase text-[10px] md:text-xs tracking-widest transition-colors">Abort</button>
              <button
                onClick={handleSaveExpense}
                className="w-full md:w-auto px-8 md:px-12 py-3 md:py-4 bg-purpleheart text-white rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest shadow-xl transition-all active:scale-95"
              >
                {editingExpenseId ? 'Commit' : 'Authorize'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
