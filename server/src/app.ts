import express from 'express';
import cors from 'cors';
import path from 'path';
import { getDb } from './db';
import { z } from 'zod';

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Routes
import businessRoutes from './routes/businesses';
import clientRoutes from './routes/clients';
import invoiceRoutes from './routes/invoices';
import expenseRoutes from './routes/expenses';
import budgetRoutes from './routes/budgets';

app.use('/api/businesses', businessRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// SPA Fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

export default app;
