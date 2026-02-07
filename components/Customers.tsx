
import React, { useState } from 'react';
import { Client, Representative, Invoice, BusinessProfile } from '../types';
// Import missing Icons to resolve error on line 125
import { Icons } from '../constants';

interface CustomersProps {
  clients: Client[];
  allClients: Client[];
  onAddClient: (client: Client) => void;
  onUpdateClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
  allInvoices: Invoice[];
  business: BusinessProfile;
}

const Customers: React.FC<CustomersProps> = ({ clients, allClients, onAddClient, onUpdateClient, onDeleteClient, allInvoices, business }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [newClient, setNewClient] = useState<Partial<Client>>({ name: '', address: '', representatives: [] });

  const handleSave = () => {
    if (!newClient.name) return;
    if (editingClient) {
      onUpdateClient({ ...editingClient, ...newClient } as Client);
    } else {
      const client: Client = {
        id: `C-${Date.now()}`,
        businessId: business.id,
        name: newClient.name!,
        address: newClient.address || '',
        representatives: newClient.representatives || []
      };
      onAddClient(client);
    }
    setIsAdding(false);
    setEditingClient(null);
    setNewClient({ name: '', address: '', representatives: [] });
  };

  const handleDelete = (id: string) => {
    const hasInvoices = allInvoices.some(inv => inv.clientId === id);
    if (hasInvoices) {
      alert("INTEGRITY BLOCK: This customer is referenced in active or historical ledger entries. You must purge or archive all associated invoices for this client before removing the corporate profile from the registry.");
      return;
    }
    if (window.confirm("FATAL ACTION: This will permanently purge this corporate entity and all registered billing contacts. This creates a hole in the historical audit trail. Continue?")) {
      onDeleteClient(id);
    }
  };

  const addRepresentative = () => {
    const rep: Representative = { id: `R-${Date.now()}`, name: '', department: '', email: '' };
    setNewClient({ ...newClient, representatives: [...(newClient.representatives || []), rep] });
  };

  const updateRep = (id: string, field: keyof Representative, value: string) => {
    setNewClient({
      ...newClient,
      representatives: (newClient.representatives || []).map(r => r.id === id ? { ...r, [field]: value } : r)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-oak uppercase tracking-tighter">Customer Registry</h2>
          <p className="text-xs font-medium text-slate-500">Managing {clients.length} business relationships for {business.name}.</p>
        </div>
        <button
          onClick={() => { setIsAdding(true); setEditingClient(null); setNewClient({ name: '', address: '', representatives: [] }); }}
          className="bg-purpleheart text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-purpleheartdark transition-all hover:scale-105 active:scale-95"
        >
          Add Customer
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {clients.map(client => (
          <div key={client.id} className="bg-white border border-oak/10 rounded-[40px] p-10 shadow-sm hover:shadow-2xl transition-all relative group overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="absolute top-6 right-6 flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => { setEditingClient(client); setNewClient(client); setIsAdding(true); }}
                className="text-purpleheart hover:bg-purpleheart/5 p-3 rounded-2xl transition-colors bg-white border border-purpleheart/10 shadow-sm"
                title="Edit Client"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
              </button>
              <button
                onClick={() => handleDelete(client.id)}
                className="text-rose-500 hover:bg-rose-50 p-3 rounded-2xl transition-colors bg-white border border-rose-100 shadow-sm"
                title="Delete Client"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
              </button>
            </div>

            <div className="mb-8 pr-12">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-maple border border-mapledark flex items-center justify-center text-oak font-black text-xl shadow-inner">
                  {client.name.charAt(0)}
                </div>
                <h3 className="text-2xl font-black text-oak leading-tight tracking-tight">{client.name}</h3>
              </div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">Legal/Billing Address</p>
              <p className="text-xs text-slate-500 font-medium italic leading-relaxed line-clamp-3">{client.address || 'No address registered.'}</p>
            </div>

            <div className="space-y-4 bg-maple/20 p-6 rounded-3xl border border-mapledark/30">
              <p className="text-[10px] font-black text-purpleheart uppercase tracking-[0.2em] border-b border-purpleheart/10 pb-2">Registered Contacts</p>
              {client.representatives.map(rep => (
                <div key={rep.id} className="flex justify-between items-center text-xs group/rep">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-700">{rep.name}</span>
                    <span className="text-[9px] text-slate-400 font-medium">{rep.email}</span>
                  </div>
                  <span className="text-purpleheart/40 uppercase font-black text-[8px] tracking-widest bg-white px-2 py-0.5 rounded-lg border border-purpleheart/10">{rep.department}</span>
                </div>
              ))}
              {client.representatives.length === 0 && <p className="text-[10px] italic text-slate-300 text-center py-2">No contacts registered.</p>}
            </div>
          </div>
        ))}
        {clients.length === 0 && (
          <div className="col-span-full py-24 text-center bg-white border-4 border-dashed border-mapledark rounded-[40px] group hover:border-oak transition-colors cursor-pointer" onClick={() => setIsAdding(true)}>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-maple flex items-center justify-center text-mapledark mb-6 group-hover:scale-110 transition-transform">
                <Icons.Customers />
              </div>
              <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] mb-2">Registry Offline</p>
              <p className="text-xs text-slate-300 font-medium">Click here to register your first corporate client.</p>
            </div>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-oak/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl border-4 border-white max-h-[90vh] animate-in slide-in-from-bottom-8 duration-300">
            <div className="p-8 bg-oak text-white flex justify-between items-center wood-texture shrink-0">
              <h3 className="text-2xl font-black uppercase tracking-tighter">{editingClient ? 'Edit Corporate Record' : 'New Corporate Registry'}</h3>
              <button onClick={() => setIsAdding(false)} className="text-maple hover:text-white transition-colors p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>
            </div>
            <div className="p-10 space-y-10 overflow-y-auto bg-maple/5">
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Legal Name</label>
                  <input
                    value={newClient.name}
                    onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                    placeholder="Ex: Luxe Hotel Group LLC"
                    className="w-full border-2 border-maple rounded-[20px] px-6 py-4 font-black text-oak text-lg outline-none focus:ring-4 focus:ring-purpleheart/10 transition-all placeholder:text-maple placeholder:font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Billing & Registered Office Address</label>
                  <textarea
                    value={newClient.address}
                    onChange={e => setNewClient({ ...newClient, address: e.target.value })}
                    placeholder="Full street address and tax jurisdiction..."
                    className="w-full border-2 border-maple rounded-[20px] px-6 py-4 font-bold text-sm text-oak outline-none focus:ring-4 focus:ring-purpleheart/10 transition-all min-h-[100px]"
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-maple pb-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Authorized Billing Contacts</label>
                  <button onClick={addRepresentative} className="text-purpleheart font-black text-[10px] uppercase underlineDecoration-2 transition-all hover:translate-x-1">+ Register New Contact</button>
                </div>
                <div className="space-y-6">
                  {(newClient.representatives || []).map(rep => (
                    <div key={rep.id} className="grid grid-cols-2 gap-6 p-8 bg-white rounded-[32px] border-2 border-maple shadow-sm group/rep relative">
                      <button
                        onClick={() => setNewClient({ ...newClient, representatives: newClient.representatives?.filter(r => r.id !== rep.id) })}
                        className="absolute top-4 right-4 text-rose-300 hover:text-rose-500 transition-colors p-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                      </button>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest ml-1">Full Name</label>
                        <input value={rep.name} onChange={e => updateRep(rep.id, 'name', e.target.value)} className="w-full border-b-2 border-maple px-1 py-2 text-sm font-black text-oak outline-none focus:border-purpleheart transition-colors" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest ml-1">Department/Role</label>
                        <input value={rep.department} onChange={e => updateRep(rep.id, 'department', e.target.value)} className="w-full border-b-2 border-maple px-1 py-2 text-sm font-bold text-oak outline-none focus:border-purpleheart transition-colors" />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest ml-1">Professional Email</label>
                        <input value={rep.email} onChange={e => updateRep(rep.id, 'email', e.target.value)} className="w-full border-b-2 border-maple px-1 py-2 text-sm font-medium text-slate-600 outline-none focus:border-purpleheart transition-colors" />
                      </div>
                    </div>
                  ))}
                  {(newClient.representatives || []).length === 0 && (
                    <div className="text-center py-10 bg-maple/10 rounded-[32px] border-2 border-dashed border-maple text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">
                      No Contacts Listed
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-10 border-t-2 border-maple flex justify-end space-x-6 bg-white shrink-0">
              <button onClick={() => setIsAdding(false)} className="px-8 py-3 font-black uppercase text-xs hover:text-rose-500 transition-colors">Discard</button>
              <button
                onClick={handleSave}
                className="bg-purpleheart text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                {editingClient ? 'Commit Changes' : 'Register Corporate Entity'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
