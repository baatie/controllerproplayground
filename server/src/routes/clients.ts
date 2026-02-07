import { Router } from 'express';
import { getDb } from '../db';
import { z } from 'zod';

const router = Router();

const RepresentativeSchema = z.object({
    id: z.string(),
    name: z.string(),
    department: z.string(),
    email: z.string(),
});

const ClientSchema = z.object({
    id: z.string(),
    businessId: z.string(),
    name: z.string(),
    representatives: z.array(RepresentativeSchema),
    address: z.string(),
});

router.get('/', async (req, res) => {
    const { businessId } = req.query;
    const db = await getDb();
    let query = 'SELECT * FROM clients';
    const params: any[] = [];

    if (businessId) {
        query += ' WHERE businessId = ?';
        params.push(businessId);
    }

    const rows = await db.all(query, params);
    const clients = rows.map(row => ({
        ...row,
        representatives: JSON.parse(row.representatives),
    }));
    res.json(clients);
});

router.post('/', async (req, res) => {
    try {
        const client = ClientSchema.parse(req.body);
        const db = await getDb();

        await db.run(
            `INSERT INTO clients (id, businessId, name, representatives, address)
       VALUES (?, ?, ?, ?, ?)`,
            [
                client.id,
                client.businessId,
                client.name,
                JSON.stringify(client.representatives),
                client.address
            ]
        );
        res.json(client);
    } catch (error) {
        res.status(400).json({ error: error });
    }
});

router.delete('/:id', async (req, res) => {
    const db = await getDb();
    await db.run('DELETE FROM clients WHERE id = ?', req.params.id);
    res.json({ success: true });
});

export default router;
