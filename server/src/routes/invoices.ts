import { Router } from 'express';
import { getDb } from '../db';
import { z } from 'zod';

const router = Router();

// Validation Schemas
const LineItemSchema = z.object({
    id: z.string(),
    description: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
});

const PaymentRecordSchema = z.object({
    id: z.string(),
    amount: z.number(),
    date: z.string(),
    method: z.string(),
});

const InvoiceSchema = z.object({
    id: z.string(),
    businessId: z.string(),
    clientId: z.string(),
    representativeId: z.string(),
    items: z.array(LineItemSchema),
    issueDate: z.string(),
    dueDate: z.string(),
    status: z.enum(['draft', 'sent', 'paid', 'overdue']),
    total: z.number(),
    payments: z.array(PaymentRecordSchema),
    customerPo: z.string().optional(),
    taxRate: z.number().optional(),
    templateId: z.string().optional(),
});

// Routes
router.get('/', async (req, res) => {
    const { businessId } = req.query;
    const db = await getDb();
    let query = 'SELECT * FROM invoices';
    const params: any[] = [];

    if (businessId) {
        query += ' WHERE businessId = ?';
        params.push(businessId);
    }

    const rows = await db.all(query, params);
    const invoices = rows.map(row => ({
        ...row,
        items: JSON.parse(row.items),
        payments: JSON.parse(row.payments),
    }));
    res.json(invoices);
});

router.post('/', async (req, res) => {
    try {
        const invoice = InvoiceSchema.parse(req.body);
        const db = await getDb();

        await db.run(
            `INSERT INTO invoices (id, businessId, clientId, representativeId, items, issueDate, dueDate, status, total, payments, customerPo, taxRate, templateId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                invoice.id,
                invoice.businessId,
                invoice.clientId,
                invoice.representativeId,
                JSON.stringify(invoice.items),
                invoice.issueDate,
                invoice.dueDate,
                invoice.status,
                invoice.total,
                JSON.stringify(invoice.payments),
                invoice.customerPo,
                invoice.taxRate,
                invoice.templateId
            ]
        );
        res.json(invoice);
    } catch (error) {
        res.status(400).json({ error: error });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const invoice = InvoiceSchema.parse(req.body);
        const db = await getDb();

        await db.run(
            `UPDATE invoices SET businessId=?, clientId=?, representativeId=?, items=?, issueDate=?, dueDate=?, status=?, total=?, payments=?, customerPo=?, taxRate=?, templateId=? WHERE id=?`,
            [
                invoice.businessId,
                invoice.clientId,
                invoice.representativeId,
                JSON.stringify(invoice.items),
                invoice.issueDate,
                invoice.dueDate,
                invoice.status,
                invoice.total,
                JSON.stringify(invoice.payments),
                invoice.customerPo,
                invoice.taxRate,
                invoice.templateId,
                req.params.id
            ]
        );
        res.json(invoice);
    } catch (error) {
        res.status(400).json({ error: error });
    }
});

router.delete('/:id', async (req, res) => {
    const db = await getDb();
    await db.run('DELETE FROM invoices WHERE id = ?', req.params.id);
    res.json({ success: true });
});

export default router;
