import { BusinessProfile, Client, Invoice, Expense, ProjectBudget } from '../types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
}

export const api = {
    businesses: {
        list: () => request<BusinessProfile[]>('/businesses'),
        create: (data: BusinessProfile) => request<BusinessProfile>('/businesses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
        update: (id: string, data: BusinessProfile) => request<BusinessProfile>(`/businesses/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
        delete: (id: string) => request<{ success: boolean }>(`/businesses/${id}`, { method: 'DELETE' }),
    },
    clients: {
        list: (businessId: string) => request<Client[]>(`/clients?businessId=${businessId}`),
        create: (data: Client) => request<Client>('/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
        delete: (id: string) => request<{ success: boolean }>(`/clients/${id}`, { method: 'DELETE' }),
    },
    invoices: {
        list: (businessId: string) => request<Invoice[]>(`/invoices?businessId=${businessId}`),
        create: (data: Invoice) => request<Invoice>('/invoices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
        update: (id: string, data: Invoice) => request<Invoice>(`/invoices/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
        delete: (id: string) => request<{ success: boolean }>(`/invoices/${id}`, { method: 'DELETE' }),
    },
    expenses: {
        list: (businessId: string) => request<Expense[]>(`/expenses?businessId=${businessId}`),
        create: (data: Expense) => request<Expense>('/expenses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
        delete: (id: string) => request<{ success: boolean }>(`/expenses/${id}`, { method: 'DELETE' }),
    },
    budgets: {
        list: (businessId: string) => request<ProjectBudget[]>(`/budgets?businessId=${businessId}`),
        create: (data: ProjectBudget) => request<ProjectBudget>('/budgets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
        update: (id: string, data: ProjectBudget) => request<ProjectBudget>(`/budgets/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
        delete: (id: string) => request<{ success: boolean }>(`/budgets/${id}`, { method: 'DELETE' }),
    },
};
