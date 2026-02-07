
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Invoice, Client, BusinessProfile, LineItem, Expense, PaymentRecord } from '../types';
import { Icons } from '../constants';
import * as ReactToPrint from 'react-to-print';

interface InvoicesProps {
  invoices: Invoice[];
  allInvoices: Invoice[];
  clients: Client[];
  business: BusinessProfile;
  onAddInvoice: (invoice: Invoice) => void;
  onUpdateInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  allExpenses: Expense[];
}

const Invoices: React.FC<InvoicesProps> = ({ invoices, allInvoices, clients, business, onAddInvoice, onUpdateInvoice, onDeleteInvoice, allExpenses }) => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const [customInvoiceId, setCustomInvoiceId] = useState('');
  const [newClientId, setNewClientId] = useState('');
  const [newRepId, setNewRepId] = useState('');
  const [newIssueDate, setNewIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDueDate, setNewDueDate] = useState('');
  const [newPo, setNewPo] = useState('');
  const [newTaxRate, setNewTaxRate] = useState<number>(0);
  const [newStatus, setNewStatus] = useState<Invoice['status']>('sent');
  const [newItems, setNewItems] = useState<LineItem[]>([{ id: '1', description: '', quantity: 1, unitPrice: 0 }]);
  const [newPayments, setNewPayments] = useState<PaymentRecord[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(business.theming?.layout || 'executive');

  const contentRef = useRef<HTMLDivElement>(null);
  const useReactToPrintHook = (ReactToPrint as any).useReactToPrint || (ReactToPrint as any).default?.useReactToPrint;

  // Automatically calculate due date when issue date or net days change
  // Note: User can still manually override this in the input field
  useEffect(() => {
    if (newIssueDate && !editingInvoiceId) {
      const issue = new Date(newIssueDate);
      if (!isNaN(issue.getTime())) {
        const due = new Date(issue);
        due.setDate(due.getDate() + (business.defaultNetDays || 0));
        setNewDueDate(due.toISOString().split('T')[0]);
      }
    }
  }, [newIssueDate, business.defaultNetDays, editingInvoiceId]);

  const handlePrint = useReactToPrintHook({
    contentRef,
    documentTitle: selectedInvoice ? `Invoice_${selectedInvoice.id}` : 'Invoice',
    onAfterPrint: () => {
      setIsExporting(false);
    },
    removeAfterPrint: true,
  });

  const handleInitiateShare = async () => {
    if (!selectedInvoice) return;
    setIsExporting(true);
    setTimeout(() => {
      handlePrint();
    }, 500);
  };

  const subtotalCalculation = useMemo(() =>
    newItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    , [newItems]);

  const taxCalculation = useMemo(() =>
    subtotalCalculation * (newTaxRate / 100)
    , [subtotalCalculation, newTaxRate]);

  const totalCalculation = useMemo(() =>
    subtotalCalculation + taxCalculation
    , [subtotalCalculation, taxCalculation]);

  const totalPaidCalculation = useMemo(() =>
    newPayments.reduce((sum, p) => sum + p.amount, 0)
    , [newPayments]);

  const balanceDue = useMemo(() =>
    Math.max(0, totalCalculation - totalPaidCalculation)
    , [totalCalculation, totalPaidCalculation]);

  const handleCreateOrUpdateInvoice = () => {
    let status = newStatus;
    if (totalPaidCalculation >= totalCalculation && totalCalculation > 0) {
      status = 'paid';
    } else if (totalPaidCalculation > 0 && totalPaidCalculation < totalCalculation) {
      status = 'sent';
    }

    const invoiceData: Invoice = {
      id: customInvoiceId || `INV-${Date.now()}`,
      businessId: business.id,
      clientId: newClientId,
      representativeId: newRepId,
      items: newItems,
      issueDate: newIssueDate,
      dueDate: newDueDate,
      status: status,
      total: totalCalculation,
      payments: newPayments,
      customerPo: newPo,
      taxRate: newTaxRate,
      templateId: selectedTemplateId
    };

    if (editingInvoiceId) {
      onUpdateInvoice(invoiceData);
    } else {
      onAddInvoice(invoiceData);
    }
    setIsCreating(false);
    resetForm();
  };

  const handleDeleteInvoice = (id: string) => {
    if (window.confirm("FATAL ACTION: This will permanently remove this invoice from the historical ledger. This is irreversible. Continue?")) {
      onDeleteInvoice(id);
      if (selectedInvoice?.id === id) setSelectedInvoice(null);
    }
  };

  const resetForm = () => {
    const issue = new Date().toISOString().split('T')[0];
    const due = new Date(new Date(issue).getTime() + 86400000 * business.defaultNetDays).toISOString().split('T')[0];
    setCustomInvoiceId(`INV-${Date.now().toString().slice(-6)}`);
    setNewClientId('');
    setNewRepId('');
    setNewIssueDate(issue);
    setNewDueDate(due);
    setNewPo('');
    setNewTaxRate(0);
    setNewStatus('sent');
    setNewItems([{ id: '1', description: '', quantity: 1, unitPrice: 0 }]);
    setNewPayments([]);
    setEditingInvoiceId(null);
    setSelectedTemplateId(business.theming?.layout || 'executive');
  };

  const startEdit = (inv: Invoice) => {
    setEditingInvoiceId(inv.id);
    setCustomInvoiceId(inv.id);
    setNewClientId(inv.clientId);
    setNewRepId(inv.representativeId);
    setNewIssueDate(inv.issueDate);
    setNewDueDate(inv.dueDate);
    setNewPo(inv.customerPo || '');
    setNewTaxRate(inv.taxRate || 0);
    setNewStatus(inv.status);
    setNewItems(inv.items);
    setNewPayments(inv.payments || []);
    setSelectedTemplateId(inv.templateId || business.theming?.layout || 'executive');
    setIsCreating(true);
  };

  const formatCurrency = (val: number) => val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const getStatusStyles = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'sent': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'overdue': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const currentInvoiceClient = useMemo(() => clients.find(c => c.id === (selectedInvoice?.clientId || newClientId)), [selectedInvoice, newClientId, clients]);
  const currentInvoiceRepresentative = useMemo(() => currentInvoiceClient?.representatives.find(r => r.id === (selectedInvoice?.representativeId || newRepId)), [currentInvoiceClient, selectedInvoice, newRepId]);
  const selectedClientReps = useMemo(() => clients.find(c => c.id === newClientId)?.representatives || [], [newClientId, clients]);

  return (
    <div className="space-y-6">
      {isExporting && (
        <div className="fixed inset-0 bg-oak/80 backdrop-blur-2xl z-[1000] flex flex-col items-center justify-center text-white no-print">
          <div className="w-24 h-24 border-[6px] border-white/10 border-t-purpleheart rounded-full animate-spin mb-8"></div>
          <h3 className="text-2xl font-black uppercase tracking-widest">Generating PDF Artifact...</h3>
          <p className="text-xs font-bold text-white/60 mt-2 uppercase tracking-widest">Finalizing Ledger Formatting</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-oak uppercase tracking-tighter">Accounts Receivable</h2>
          <p className="text-xs font-medium text-slate-500">Managing {invoices.length} active invoices.</p>
        </div>
        <button onClick={() => { resetForm(); setIsCreating(true); }} className="bg-purpleheart text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-purpleheartdark transition-all">Generate Invoice</button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-mapledark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-maple border-b border-mapledark">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-oak uppercase tracking-widest">ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-oak uppercase tracking-widest">Client</th>
                <th className="px-6 py-4 text-[10px] font-black text-oak uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-oak uppercase tracking-widest text-right">Yield</th>
                <th className="px-6 py-4 text-[10px] font-black text-oak uppercase tracking-widest text-right">Total</th>
                <th className="px-6 py-4 text-[10px] font-black text-oak uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-maple">
              {invoices.map(invoice => {
                const yieldVal = invoice.total - allExpenses.filter(e => e.invoiceId === invoice.id).reduce((s, e) => s + e.amount, 0);
                return (
                  <tr key={invoice.id} className="hover:bg-maple/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-oak text-sm">{invoice.id}</td>
                    <td className="px-6 py-4 text-slate-700 text-sm font-medium">{clients.find(c => c.id === invoice.clientId)?.name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyles(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className={`px-6 py-4 font-black text-sm text-right ${yieldVal < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>${formatCurrency(yieldVal)}</td>
                    <td className="px-6 py-4 font-black text-slate-900 text-sm text-right">${formatCurrency(invoice.total)}</td>
                    <td className="px-6 py-4 text-right flex items-center justify-end space-x-3">
                      <button onClick={() => startEdit(invoice)} className="text-purpleheart hover:text-purpleheartdark font-black text-[10px] uppercase">Edit</button>
                      <button onClick={() => setSelectedInvoice(invoice)} className="bg-oak text-white px-3 py-1.5 rounded-lg font-black text-[10px] uppercase hover:bg-oakdark transition-colors">View</button>
                      <button onClick={() => handleDeleteInvoice(invoice.id)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors" title="Delete Invoice">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium italic uppercase tracking-widest text-[10px]">Registry Empty</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-oak/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl border-4 border-white">
            <div className="p-8 bg-oak text-white flex justify-between items-center wood-texture shrink-0">
              <h3 className="text-2xl font-black uppercase tracking-tighter">{editingInvoiceId ? 'Edit Ledger' : 'New Invoice'}</h3>
              <button onClick={() => setIsCreating(false)} className="text-maple hover:text-white transition-all hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 space-y-10 bg-maple/5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</label>
                  <input value={customInvoiceId} onChange={e => setCustomInvoiceId(e.target.value)} className="w-full border-2 border-mapledark rounded-xl px-4 py-3 font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</label>
                  <select value={newClientId} onChange={e => { setNewClientId(e.target.value); setNewRepId(''); }} className="w-full border-2 border-mapledark rounded-xl px-4 py-3 font-bold">
                    <option value="">Select...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Billing Contact</label>
                  <select value={newRepId} onChange={e => setNewRepId(e.target.value)} disabled={!newClientId} className="w-full border-2 border-mapledark rounded-xl px-4 py-3 font-bold disabled:opacity-50">
                    <option value="">Select Contact...</option>
                    {selectedClientReps.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Issue Date</label>
                  <input type="date" value={newIssueDate} onChange={e => setNewIssueDate(e.target.value)} className="w-full border-2 border-mapledark rounded-xl px-4 py-3 font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</label>
                  <input type="date" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} className="w-full border-2 border-purpleheart/20 rounded-xl px-4 py-3 font-black text-purpleheart focus:border-purpleheart outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer PO (Opt)</label>
                  <input value={newPo} onChange={e => setNewPo(e.target.value)} placeholder="PO Number..." className="w-full border-2 border-mapledark rounded-xl px-4 py-3 font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex justify-between items-center border-b border-maple pb-2">
                    <h4 className="font-black uppercase text-[10px] tracking-widest text-oak">Line Items</h4>
                    <button onClick={() => setNewItems([...newItems, { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0 }])} className="text-purpleheart font-black text-[10px] uppercase underlineDecoration-2 transition-all hover:translate-x-1">+ Add Row</button>
                  </div>
                  <div className="space-y-3">
                    {newItems.map(item => (
                      <div key={item.id} className="flex gap-4 items-center animate-in slide-in-from-left-2">
                        <input placeholder="Description" className="flex-1 border-2 border-maple rounded-xl px-4 py-3 text-sm font-bold" value={item.description} onChange={e => setNewItems(newItems.map(i => i.id === item.id ? { ...i, description: e.target.value } : i))} />
                        <input type="number" className="w-20 border-2 border-maple rounded-xl px-4 py-3 text-sm text-center font-black" value={item.quantity} onChange={e => setNewItems(newItems.map(i => i.id === item.id ? { ...i, quantity: parseFloat(e.target.value) || 0 } : i))} />
                        <input type="number" className="w-32 border-2 border-maple rounded-xl px-4 py-3 text-sm text-right font-black text-purpleheart" value={item.unitPrice} onChange={e => setNewItems(newItems.map(i => i.id === item.id ? { ...i, unitPrice: parseFloat(e.target.value) || 0 } : i))} />
                        <button onClick={() => setNewItems(newItems.filter(i => i.id !== item.id))} className="text-rose-500 hover:bg-rose-50 p-2 rounded-xl">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-maple pb-2">
                    <h4 className="font-black uppercase text-[10px] tracking-widest text-oak">Payments Record</h4>
                    <button onClick={() => setNewPayments([...newPayments, { id: Date.now().toString(), amount: 0, date: new Date().toISOString().split('T')[0], method: 'Wire' }])} className="text-emerald-600 font-black text-[10px] uppercase underlineDecoration-2">+ Add Payment</button>
                  </div>
                  <div className="space-y-4">
                    {newPayments.map(p => (
                      <div key={p.id} className="bg-white p-4 rounded-2xl border-2 border-maple space-y-3 shadow-sm relative group">
                        <button onClick={() => setNewPayments(newPayments.filter(pay => pay.id !== p.id))} className="absolute top-2 right-2 text-rose-300 hover:text-rose-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-slate-400">Date</label>
                            <input type="date" value={p.date} onChange={e => setNewPayments(newPayments.map(pay => pay.id === p.id ? { ...pay, date: e.target.value } : pay))} className="w-full text-xs font-bold border-b border-maple py-1 outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-slate-400">Method</label>
                            <input value={p.method} onChange={e => setNewPayments(newPayments.map(pay => pay.id === p.id ? { ...pay, method: e.target.value } : pay))} className="w-full text-xs font-bold border-b border-maple py-1 outline-none" />
                          </div>
                          <div className="col-span-2 space-y-1">
                            <label className="text-[8px] font-black uppercase text-slate-400">Amount Received ($)</label>
                            <input type="number" value={p.amount} onChange={e => setNewPayments(newPayments.map(pay => pay.id === p.id ? { ...pay, amount: parseFloat(e.target.value) || 0 } : pay))} className="w-full text-sm font-black text-emerald-600 border-b border-maple py-1 outline-none" />
                          </div>
                        </div>
                      </div>
                    ))}
                    {newPayments.length === 0 && <p className="text-[10px] italic text-slate-400 text-center py-4 bg-white/30 rounded-2xl border-2 border-dashed border-maple">No payments documented.</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-10 border-t-2 border-maple flex flex-col lg:flex-row justify-between items-center bg-white shrink-0 gap-6">
              <div className="flex flex-wrap gap-8 items-center">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tax Rate (%)</span>
                  <input type="number" value={newTaxRate} onChange={e => setNewTaxRate(parseFloat(e.target.value) || 0)} className="w-20 border-2 border-maple rounded-xl px-3 py-2 font-black text-sm" />
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Due</span>
                  <span className="text-3xl font-black text-oak tracking-tighter">${formatCurrency(totalCalculation)}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Paid to Date</span>
                  <span className="text-3xl font-black text-emerald-600 tracking-tighter">${formatCurrency(totalPaidCalculation)}</span>
                </div>
                <div className="flex flex-col text-right border-l-2 border-maple pl-8">
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Due Date</span>
                  <span className="text-3xl font-black text-rose-500 tracking-tighter">{newDueDate}</span>
                </div>
                <div className="flex flex-col text-right border-l-2 border-maple pl-8">
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Balance</span>
                  <span className="text-3xl font-black text-rose-500 tracking-tighter">${formatCurrency(balanceDue)}</span>
                </div>
              </div>
              <div className="flex space-x-4">
                <button onClick={() => setIsCreating(false)} className="px-6 py-2 font-black uppercase text-xs hover:text-rose-500 transition-colors">Discard</button>
                <button onClick={handleCreateOrUpdateInvoice} className="bg-purpleheart text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95">Commit Registry</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedInvoice && (
        <div className="fixed inset-0 bg-oak/60 backdrop-blur-md z-[100] flex justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl h-fit rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-maple flex justify-between items-center no-print">
              <button onClick={() => setSelectedInvoice(null)} className="p-2 bg-maple rounded-xl hover:bg-mapledark transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>
              <div className="flex space-x-3">
                <button onClick={() => handleDeleteInvoice(selectedInvoice.id)} className="bg-rose-50 text-rose-600 px-6 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest border border-rose-200 hover:bg-rose-100 transition-colors">Purge Invoice</button>
                <button onClick={() => { startEdit(selectedInvoice); setSelectedInvoice(null); }} className="bg-maple text-oak px-6 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-mapledark">Edit Ledger</button>
                <button onClick={handleInitiateShare} className="bg-purpleheart text-white px-8 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:scale-105 transition-all">Export & Share</button>
              </div>
            </div>

            <div ref={contentRef} className="p-16 space-y-12 text-slate-800 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-4xl font-black text-indigo-900 tracking-tighter uppercase leading-none mb-4">{business.name}</h1>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registered Office</p>
                    <p className="text-xs font-bold whitespace-pre-line">{business.address}</p>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-5xl font-black text-slate-100 tracking-tighter uppercase mb-2">Invoice</h2>
                  <p className="font-black text-sm uppercase tracking-widest text-indigo-900">Reference: {selectedInvoice.id}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Status: {selectedInvoice.status}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-20 py-10 border-y border-slate-100">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bill to</p>
                  <div className="space-y-1">
                    <p className="text-xl font-black text-slate-900">{currentInvoiceClient?.name}</p>
                    <p className="text-xs font-medium text-slate-500 whitespace-pre-wrap">{currentInvoiceClient?.address}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Issue Date</span>
                    <span className="text-xs font-black">{selectedInvoice.issueDate}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Due</span>
                    <span className="text-xs font-black">{selectedInvoice.dueDate}</span>
                  </div>
                  {selectedInvoice.customerPo && (
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer PO</span>
                      <span className="text-xs font-black">{selectedInvoice.customerPo}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance Due</span>
                    <span className="text-xs font-black text-rose-600">${formatCurrency(selectedInvoice.total - (selectedInvoice.payments?.reduce((s, p) => s + p.amount, 0) || 0))}</span>
                  </div>
                </div>
              </div>

              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-indigo-900">
                    <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Description</th>
                    <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Qty</th>
                    <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Price</th>
                    <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoice.items.map(item => (
                    <tr key={item.id}>
                      <td className="py-8 text-sm font-bold text-slate-900">{item.description}</td>
                      <td className="py-8 text-sm font-bold text-center">{item.quantity}</td>
                      <td className="py-8 text-sm font-bold text-right text-slate-600">${formatCurrency(item.unitPrice)}</td>
                      <td className="py-8 text-sm font-black text-right text-indigo-900">${formatCurrency(item.quantity * item.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {selectedInvoice.payments && selectedInvoice.payments.length > 0 && (
                <div className="pt-10 space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Payment History</h4>
                  <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                    <table className="w-full text-left text-[10px] font-bold text-emerald-800">
                      <thead>
                        <tr className="opacity-50 border-b border-emerald-200">
                          <th className="pb-2">Date</th>
                          <th className="pb-2">Method</th>
                          <th className="pb-2 text-right">Amount Applied</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoice.payments.map(p => (
                          <tr key={p.id}>
                            <td className="py-2">{p.date}</td>
                            <td className="py-2">{p.method}</td>
                            <td className="py-2 text-right">${formatCurrency(p.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-10">
                <div className="w-72 space-y-4">
                  <div className="flex justify-between text-xs font-bold text-slate-400">
                    <span>Net Aggregate</span>
                    <span>${formatCurrency(selectedInvoice.items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0))}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-400">
                    <span>Tax ({selectedInvoice.taxRate}%)</span>
                    <span>${formatCurrency((selectedInvoice.items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0) * (selectedInvoice.taxRate || 0)) / 100)}</span>
                  </div>
                  <div className="flex justify-between pt-6 border-t-4 border-indigo-900">
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-900">Amount Due</span>
                    <span className="text-3xl font-black text-indigo-900 tracking-tighter">${formatCurrency(selectedInvoice.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
