
import React from 'react';
import { BusinessProfile, Client, Expense, Invoice, ProjectBudget } from './types';

export const initialBusinesses: BusinessProfile[] = [
  {
    id: 'b1',
    name: 'Bates Furnishings',
    address: '123 Industry Way, High Point, NC 27260',
    phoneNumber: '(336) 555-0199',
    taxId: 'TX-99887766',
    defaultNetDays: 30,
    expenseCategories: ['Materials', 'Logistics', 'Showroom Rent', 'Utilities', 'Payroll', 'Marketing', 'Software'],
    theming: {
      primaryColor: '#6a0dad',
      secondaryColor: '#a67c52',
      layout: 'vanguard'
    }
  }
];

export const initialClients: Client[] = [
  {
    id: 'c1',
    businessId: 'b1',
    name: 'Luxe Hotel Group',
    address: '456 Hospitality Blvd, Miami, FL 33101',
    representatives: [
      { id: 'r1', name: 'Sarah Jenkins', department: 'Procurement', email: 's.jenkins@luxehotels.com' },
      { id: 'r2', name: 'Marcus Thorne', department: 'Billing', email: 'm.thorne@luxehotels.com' }
    ]
  }
];

export const initialInvoices: Invoice[] = [
  {
    id: 'INV-2025-001',
    businessId: 'b1',
    clientId: 'c1',
    representativeId: 'r2',
    issueDate: '2025-03-01',
    dueDate: '2025-03-31',
    status: 'sent',
    total: 12500.00,
    taxRate: 8.5,
    customerPo: 'PO-LUXE-990',
    items: [
      { id: 'li1', description: 'Custom Walnut Reception Desk', quantity: 1, unitPrice: 8500.00 },
      { id: 'li2', description: 'Velvet Lounge Chairs (Set of 4)', quantity: 2, unitPrice: 2000.00 }
    ],
    payments: [],
    templateId: 'vanguard'
  }
];

export const initialExpenses: Expense[] = [
  {
    id: 'exp1',
    businessId: 'b1',
    category: 'Logistics',
    amount: 1250.00,
    date: '2025-03-05',
    vendor: 'Global Freight Co.',
    description: 'Shipping for INV-2025-001',
    invoiceId: 'INV-2025-001'
  },
  {
    id: 'exp2',
    businessId: 'b1',
    category: 'Showroom Rent',
    amount: 4500.00,
    date: '2025-03-01',
    vendor: 'High Point Properties',
    description: 'Monthly lease payment'
  }
];

export const initialBudgets: ProjectBudget[] = [
  {
    id: 'pb1',
    businessId: 'b1',
    name: 'Metropolitan Lobby Refresh',
    totalBudget: 50000.00,
    spent: 12500.00,
    status: 'on-track'
  }
];

export const Icons = {
  Dashboard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
  ),
  Invoices: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 2v4c0 .55.45 1 1 1h4"/><path d="M3 2v20h18V7l-5-5H3z"/><path d="M13 14h3"/><path d="M13 18h3"/><path d="M8 14h1"/><path d="M8 18h1"/></svg>
  ),
  Expenses: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
  ),
  Budgets: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
  ),
  Customers: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  Settings: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
  )
};
