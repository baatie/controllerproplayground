import { Router } from 'express';
import { getDb } from '../db';
import { z } from 'zod';

const router = Router();

const ExpenseSchema = z.object({
    id: z.string(),
    businessId: z.string(),
    category: z.string(),
    amount: z.number(),
    date: z.string(),
    description: z.string(),
    vendor: z.string(),
    projectId: z.string().optional(),
    invoiceId: z.string().optional(),
    receiptData: z.string().optional(),
});

router.get('/', async (req, res) => {
    const { businessId } = req.query;
    const db = await getDb();
    let query = 'SELECT * FROM expenses';
    const params: any[] = [];

    if (businessId) {
        query += ' WHERE businessId = ?';
        params.push(businessId);
    }

    const rows = await db.all(query, params);
    res.json(rows);
});

router.post('/', async (req, res) => {
    try {
        const expense = ExpenseSchema.parse(req.body);
        const db = await getDb();

        await db.run(
            `INSERT INTO expenses (id, businessId, category, amount, date, description, vendor, projectId, invoiceId, receiptData)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                expense.id,
                expense.businessId,
                expense.category,
                expense.amount,
                expense.date,
                expense.description,
                expense.vendor,
                expense.projectId,
                expense.invoiceId,
                expense.receiptData
            ]
        );
        res.json(expense);
    } catch (error) {
        res.status(400).json({ error: error });
    }
});

router.delete('/:id', async (req, res) => {
    const db = await getDb();
    await db.run('DELETE FROM expenses WHERE id = ?', req.params.id);
    res.json({ success: true });
});

export default router;
