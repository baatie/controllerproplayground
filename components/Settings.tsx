
import React, { useState, useRef, useEffect } from 'react';
import { BusinessProfile } from '../types';

interface SettingsProps {
  business: BusinessProfile;
  businesses: BusinessProfile[];
  onUpdateBusiness: (updated: BusinessProfile) => void;
  onAddBusiness: (newBiz: BusinessProfile) => void;
  onDeleteBusiness: (id: string) => void;
  onRestoreVault: (data: any) => void;
  onRestoreEntity: (data: any) => void;
  onFreshStart: () => void;
  contextData: any; // data for the current active business only
  allData: any; // data for the entire system
}

const Settings: React.FC<SettingsProps> = ({ 
  business, 
  businesses, 
  onUpdateBusiness, 
  onAddBusiness,
  onDeleteBusiness, 
  onRestoreVault,
  onRestoreEntity,
  onFreshStart,
  contextData,
  allData
}) => {
  const [name, setName] = useState(business.name);
  const [address, setAddress] = useState(business.address);
  const [phoneNumber, setPhoneNumber] = useState(business.phoneNumber || '');
  const [netDays, setNetDays] = useState(business.defaultNetDays);
  const [categoriesList, setCategoriesList] = useState<string[]>(business.expenseCategories);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [layout, setLayout] = useState(business.theming?.layout || 'executive');

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  
  const importVaultRef = useRef<HTMLInputElement>(null);
  const importEntityRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(business.name);
    setAddress(business.address);
    setPhoneNumber(business.phoneNumber || '');
    setNetDays(business.defaultNetDays);
    setCategoriesList(business.expenseCategories);
    setLayout(business.theming?.layout || 'executive');
  }, [business]);

  const handleSave = () => {
    onUpdateBusiness({
      ...business,
      name,
      address,
      phoneNumber,
      defaultNetDays: netDays,
      expenseCategories: categoriesList,
      theming: { ...business.theming, layout: layout as any }
    });
    alert('Entity configuration saved.');
  };

  const handleExportEntity = () => {
    const data = { business, ...contextData };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Entity_Vault_${business.name.replace(/\s/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportEntity = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.business) onRestoreEntity(json);
        else alert("Invalid Entity Vault file.");
      } catch (err) { alert("Failed to parse vault file."); }
    };
    reader.readAsText(file);
  };

  const handleExportSystem = () => {
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CP_Master_Portfolio_Backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSystem = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.businesses) onRestoreVault(json);
        else alert("Invalid Master Portfolio file.");
      } catch (err) { alert("Failed to parse master file."); }
    };
    reader.readAsText(file);
  };

  const handleCreateNew = () => {
    if (!newName) return;
    onAddBusiness({
      id: `b-${Date.now()}`,
      name: newName,
      address: '',
      phoneNumber: '',
      taxId: '00-0000000',
      defaultNetDays: 30,
      expenseCategories: ['Materials', 'Utilities', 'Payroll', 'Software'],
      theming: { primaryColor: '#6a0dad', secondaryColor: '#a67c52', layout: 'executive' }
    });
    setIsAddingNew(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-oak uppercase tracking-tighter">Project Configuration</h2>
          <p className="text-sm text-slate-500 font-medium">Business entity governance and data isolation.</p>
        </div>
        <div className="flex space-x-4">
          <button onClick={() => setIsAddingNew(true)} className="px-6 py-3 bg-oak text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-oaklight transition-all">Register New Business</button>
          <button onClick={handleSave} className="px-8 py-3 bg-purpleheart text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-purpleheartdark transition-all">Save Changes</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-8">
          <section className="bg-white rounded-[32px] border border-mapledark p-10 space-y-8 shadow-sm">
            <h3 className="text-[10px] font-black text-oaklight uppercase tracking-[0.2em] border-b border-maple pb-4">Corporate Profile: {business.name}</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Name</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full border-2 border-maple rounded-2xl px-5 py-3 text-sm font-bold text-oak outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</label>
                <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2} className="w-full border-2 border-maple rounded-2xl px-5 py-3 text-sm font-bold text-oak outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</label>
                  <input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="w-full border-2 border-maple rounded-2xl px-5 py-3 text-sm font-bold text-oak outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Days</label>
                  <input type="number" value={netDays} onChange={e => setNetDays(parseInt(e.target.value) || 0)} className="w-full border-2 border-maple rounded-2xl px-5 py-3 text-sm font-bold text-oak outline-none" />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[32px] border border-mapledark p-10 space-y-6 shadow-sm">
            <h3 className="text-[10px] font-black text-oaklight uppercase tracking-[0.2em] border-b border-maple pb-4">Chart of Accounts (Expenses)</h3>
            <div className="flex flex-wrap gap-2">
              {categoriesList.map(cat => (
                <div key={cat} className="flex items-center bg-maple/50 border border-mapledark px-4 py-2 rounded-xl group">
                  <span className="text-xs font-bold text-oak">{cat}</span>
                  <button onClick={() => setCategoriesList(prev => prev.filter(c => c !== cat))} className="ml-2 text-oaklight hover:text-red-500">×</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newCategoryInput} onChange={e => setNewCategoryInput(e.target.value)} placeholder="New GL Category..." className="flex-1 border-2 border-maple rounded-xl px-4 py-2 text-xs font-bold text-oak outline-none" />
              <button onClick={() => { if(newCategoryInput) { setCategoriesList([...categoriesList, newCategoryInput.trim()]); setNewCategoryInput(''); } }} className="bg-oak text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Add</button>
            </div>
          </section>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <section className="bg-white rounded-[32px] border border-mapledark p-10 space-y-8 shadow-sm">
            <h3 className="text-[10px] font-black text-oaklight uppercase tracking-[0.2em] border-b border-maple pb-4">Entity-Specific Vault</h3>
            <p className="text-xs text-slate-400 font-medium">Download or restore records for <strong>{business.name}</strong> only. This is the safest way to move client data between controllers.</p>
            <div className="space-y-4">
              <button onClick={handleExportEntity} className="w-full flex items-center justify-between p-4 bg-oak/5 hover:bg-oak/10 rounded-2xl border-2 border-oak/20 transition-all text-left">
                <div>
                  <p className="text-[10px] font-black uppercase text-oak tracking-tight">Export Entity Data</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">JSON Ledger for {business.name}</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-oak"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </button>
              <button onClick={() => importEntityRef.current?.click()} className="w-full flex items-center justify-between p-4 bg-purpleheart/5 hover:bg-purpleheart/10 rounded-2xl border-2 border-purpleheart/20 transition-all text-left">
                <div>
                  <p className="text-[10px] font-black uppercase text-purpleheart tracking-tight">Restore Entity Ledger</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Merge business data from file</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-purpleheart"><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </button>
              <input ref={importEntityRef} type="file" accept=".json" className="hidden" onChange={handleImportEntity} />
            </div>
          </section>

          <section className="bg-slate-900 rounded-[32px] p-10 space-y-8 shadow-2xl">
            <h3 className="text-[10px] font-black text-maple uppercase tracking-[0.2em] border-b border-white/10 pb-4">Master Portfolio Management</h3>
            <div className="space-y-4">
               <button onClick={handleExportSystem} className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-left text-maple">
                 <p className="text-[10px] font-black uppercase tracking-tight">Full Portfolio Export</p>
                 <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">EVERY business and ledger</p>
               </button>
               <button onClick={() => importVaultRef.current?.click()} className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-left text-maple">
                 <p className="text-[10px] font-black uppercase tracking-tight">Full Portfolio Restore</p>
                 <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Replace total system state</p>
               </button>
               <input ref={importVaultRef} type="file" accept=".json" className="hidden" onChange={handleImportSystem} />
               
               <div className="pt-8 border-t border-white/10">
                 <button onClick={() => onDeleteBusiness(business.id)} className="w-full p-4 bg-rose-500/10 hover:bg-rose-500/20 rounded-2xl border border-rose-500/20 text-center transition-all group">
                   <p className="text-[10px] font-black uppercase text-rose-500 tracking-widest group-hover:scale-105 transition-transform">Purge Entity Record</p>
                   <p className="text-[8px] font-bold text-rose-500/50 uppercase tracking-widest mt-1">Irreversible deletion from portfolio</p>
                 </button>
                 <button onClick={onFreshStart} className="w-full mt-4 p-4 text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors">Factory Reset System</button>
               </div>
            </div>
          </section>
        </div>
      </div>

      {isAddingNew && (
        <div className="fixed inset-0 bg-oak/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg p-12 space-y-8 shadow-2xl">
            <h3 className="text-2xl font-black uppercase tracking-tighter">Register New Entity</h3>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Company Legal Name" className="w-full border-2 border-maple rounded-2xl px-6 py-4 font-black" />
            <div className="flex justify-end space-x-6 pt-4">
              <button onClick={() => setIsAddingNew(false)} className="px-6 py-2 text-oak font-black uppercase text-xs">Cancel</button>
              <button onClick={handleCreateNew} disabled={!newName} className="px-10 py-4 bg-purpleheart text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 disabled:opacity-50">Create Vault</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
