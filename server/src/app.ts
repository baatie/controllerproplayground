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
// Routes
import authRoutes from './routes/auth';
import businessRoutes from './routes/businesses';
import clientRoutes from './routes/clients';
import invoiceRoutes from './routes/invoices';
import expenseRoutes from './routes/expenses';
import budgetRoutes from './routes/budgets';
import { authenticateToken } from './middleware/auth';

app.use('/api/auth', authRoutes);

// Protected Routes
app.use('/api/businesses', authenticateToken, businessRoutes);
app.use('/api/clients', authenticateToken, clientRoutes);
app.use('/api/invoices', authenticateToken, invoiceRoutes);
app.use('/api/expenses', authenticateToken, expenseRoutes);
app.use('/api/budgets', authenticateToken, budgetRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// SPA Fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

export default app;
