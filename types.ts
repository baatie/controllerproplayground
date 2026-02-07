
export interface InvoiceTheme {
  primaryColor: string;
  secondaryColor: string;
  layout: 'executive' | 'svelte' | 'vanguard' | string;
  letterheadUrl?: string;
}

export interface BusinessProfile {
  id: string;
  name: string;
  logoUrl?: string;
  phoneNumber?: string;
  address: string;
  taxId: string;
  defaultNetDays: number;
  expenseCategories: string[];
  theming: InvoiceTheme;
  templateUrl?: string;
}

export interface Representative {
  id: string;
  name: string;
  department: string;
  email: string;
}

export interface Client {
  id: string;
  businessId: string;
  name: string;
  representatives: Representative[];
  address: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface PaymentRecord {
  id: string;
  amount: number;
  date: string;
  method: string;
}

export interface Invoice {
  id: string;
  businessId: string;
  clientId: string;
  representativeId: string;
  items: LineItem[];
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  total: number;
  payments: PaymentRecord[];
  customerPo?: string;
  taxRate?: number;
  templateId?: string;
}

export interface Expense {
  id: string;
  businessId: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  vendor: string;
  projectId?: string;
  invoiceId?: string;
  receiptData?: string;
}

export interface ProjectBudget {
  id: string;
  businessId: string;
  name: string;
  totalBudget: number;
  spent: number;
  status: 'on-track' | 'at-risk' | 'over-budget';
}

export interface ReportData {
  month: string;
  income: number;
  expenses: number;
}
