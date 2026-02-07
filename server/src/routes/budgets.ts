import { Router } from 'express';
import { getDb } from '../db';
import { z } from 'zod';

const router = Router();

const BudgetSchema = z.object({
    id: z.string(),
    businessId: z.string(),
    name: z.string(),
    totalBudget: z.number(),
    spent: z.number(),
    status: z.enum(['on-track', 'at-risk', 'over-budget']),
});

router.get('/', async (req, res) => {
    const { businessId } = req.query;
    const db = await getDb();
    let query = 'SELECT * FROM budgets';
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
        const budget = BudgetSchema.parse(req.body);
        const db = await getDb();

        await db.run(
            `INSERT INTO budgets (id, businessId, name, totalBudget, spent, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [
                budget.id,
                budget.businessId,
                budget.name,
                budget.totalBudget,
                budget.spent,
                budget.status
            ]
        );
        res.json(budget);
    } catch (error) {
        res.status(400).json({ error: error });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const budget = BudgetSchema.parse(req.body);
        const db = await getDb();

        await db.run(
            `UPDATE budgets SET businessId=?, name=?, totalBudget=?, spent=?, status=? WHERE id=?`,
            [
                budget.businessId,
                budget.name,
                budget.totalBudget,
                budget.spent,
                budget.status,
                req.params.id
            ]
        );
        res.json(budget);
    } catch (error) {
        res.status(400).json({ error: error });
    }
});

router.delete('/:id', async (req, res) => {
    const db = await getDb();
    await db.run('DELETE FROM budgets WHERE id = ?', req.params.id);
    res.json({ success: true });
});

export default router;
