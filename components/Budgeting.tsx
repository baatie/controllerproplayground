
import React, { useState } from 'react';
import { ProjectBudget, BusinessProfile } from '../types';

interface BudgetingProps {
  budgets: ProjectBudget[];
  allBudgets: ProjectBudget[];
  business: BusinessProfile;
  onAddBudget: (budget: ProjectBudget) => void;
  onUpdateBudget: (budget: ProjectBudget) => void;
  onDeleteBudget: (id: string) => void;
}

const Budgeting: React.FC<BudgetingProps> = ({ budgets, allBudgets, business, onAddBudget, onUpdateBudget, onDeleteBudget }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newBudget, setNewBudget] = useState<Partial<ProjectBudget>>({ name: '', totalBudget: 0, spent: 0 });

  const handleAddBudget = () => {
    if (!newBudget.name || !newBudget.totalBudget) return;
    const budget: ProjectBudget = {
      id: `PB-${Date.now()}`,
      businessId: business.id,
      name: newBudget.name,
      totalBudget: Math.round((newBudget.totalBudget || 0) * 100) / 100,
      spent: Math.round((newBudget.spent || 0) * 100) / 100,
      status: (newBudget.spent || 0) > newBudget.totalBudget ? 'over-budget' : 'on-track'
    };
    onAddBudget(budget);
    setIsAdding(false);
    setNewBudget({ name: '', totalBudget: 0, spent: 0 });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Archive project budget?")) {
      onDeleteBudget(id);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Project Budgets</h2>
          <p className="text-xs md:text-sm text-slate-500">Monitor multi-phase project capitalization.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="w-full md:w-auto bg-slate-900 text-white px-5 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-lg active:scale-95 text-xs md:text-sm"
        >
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {budgets.map(budget => {
          const percentage = Math.round((budget.spent / budget.totalBudget) * 100);
          const isAtRisk = percentage > 85;
          const isOver = percentage > 100;

          return (
            <div key={budget.id} className="bg-white border border-slate-200 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm group hover:shadow-md transition-all relative overflow-hidden">
              <button
                onClick={() => handleDelete(budget.id)}
                className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors p-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
              </button>
              <div className="flex justify-between items-start mb-4 md:mb-6">
                <div className="max-w-[70%]">
                  <h3 className="text-base md:text-lg font-black text-slate-900 mb-1.5 truncate">{budget.name}</h3>
                  <span className={`text-[8px] md:text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${isOver ? 'bg-red-50 text-red-600' : isAtRisk ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'
                    }`}>
                    {isOver ? 'Over' : isAtRisk ? 'At Risk' : 'Healthy'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xl md:text-2xl font-black text-slate-900">${budget.totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Allocated</p>
                </div>
              </div>

              <div className="space-y-3 md:space-y-4">
                <div className="w-full bg-slate-50 h-3 md:h-4 rounded-full p-0.5 md:p-1 overflow-hidden border border-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${isOver ? 'bg-red-500' : isAtRisk ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">Utilization</span>
                  <span className={`font-bold ${isOver ? 'text-red-600' : isAtRisk ? 'text-orange-600' : 'text-slate-800'}`}>
                    {percentage}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4 mt-6 md:mt-8 pt-4 md:pt-6 border-t border-slate-50">
                <div className="bg-slate-50 rounded-xl md:rounded-2xl p-3 md:p-4">
                  <p className="text-[10px] text-slate-500 mb-1">Spent</p>
                  <p className="text-base md:text-xl font-bold text-slate-800">${budget.spent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-slate-50 rounded-xl md:rounded-2xl p-3 md:p-4">
                  <p className="text-[10px] text-slate-500 mb-1">Left</p>
                  <p className="text-base md:text-xl font-bold text-slate-800">${Math.max(0, budget.totalBudget - budget.spent).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>
          );
        })}
        {budgets.length === 0 && <p className="col-span-full py-12 text-center text-slate-400 italic">No project budgets initialized.</p>}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4">
          <div className="bg-white rounded-2xl md:rounded-3xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg md:text-xl font-bold">New Project</h3>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>
            </div>
            <div className="p-6 md:p-8 space-y-4 md:space-y-6">
              <div className="space-y-1.5 md:space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Project Name</label>
                <input
                  value={newBudget.name}
                  onChange={e => setNewBudget({ ...newBudget, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 md:py-3 focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                />
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Allocation ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newBudget.totalBudget}
                  onChange={e => setNewBudget({ ...newBudget, totalBudget: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 md:py-3 focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                />
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Initial Spend ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newBudget.spent}
                  onChange={e => setNewBudget({ ...newBudget, spent: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 md:py-3 focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                />
              </div>
            </div>
            <div className="p-4 md:p-6 border-t border-slate-100 flex justify-end space-x-3 md:space-x-4">
              <button onClick={() => setIsAdding(false)} className="px-4 md:px-6 py-2 text-slate-600 font-semibold text-xs md:text-sm">Cancel</button>
              <button
                onClick={handleAddBudget}
                className="px-6 md:px-10 py-2.5 md:py-2 bg-slate-900 text-white rounded-xl font-bold shadow-lg text-xs md:text-sm"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgeting;
