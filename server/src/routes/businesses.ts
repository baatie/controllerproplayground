import { Router } from 'express';
import { getDb } from '../db';
import { z } from 'zod';

const router = Router();

const BusinessSchema = z.object({
    id: z.string(),
    name: z.string(),
    logoUrl: z.string().optional(),
    phoneNumber: z.string().optional(),
    address: z.string(),
    taxId: z.string(),
    defaultNetDays: z.number(),
    expenseCategories: z.array(z.string()),
    theming: z.object({
        primaryColor: z.string(),
        secondaryColor: z.string(),
        layout: z.string(),
        letterheadUrl: z.string().optional(),
    }),
    templateUrl: z.string().optional(),
});

router.get('/', async (req, res) => {
    const db = await getDb();
    const rows = await db.all('SELECT * FROM businesses');
    const businesses = rows.map(row => ({
        ...row,
        expenseCategories: JSON.parse(row.expenseCategories),
        theming: JSON.parse(row.theming),
    }));
    res.json(businesses);
});

router.post('/', async (req, res) => {
    try {
        const business = BusinessSchema.parse(req.body);
        const db = await getDb();

        await db.run(
            `INSERT INTO businesses (id, name, logoUrl, phoneNumber, address, taxId, defaultNetDays, expenseCategories, theming, templateUrl)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                business.id,
                business.name,
                business.logoUrl,
                business.phoneNumber,
                business.address,
                business.taxId,
                business.defaultNetDays,
                JSON.stringify(business.expenseCategories),
                JSON.stringify(business.theming),
                business.templateUrl
            ]
        );
        res.json(business);
    } catch (error) {
        res.status(400).json({ error: error });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const business = BusinessSchema.parse(req.body);
        const db = await getDb();

        await db.run(
            `UPDATE businesses SET name=?, logoUrl=?, phoneNumber=?, address=?, taxId=?, defaultNetDays=?, expenseCategories=?, theming=?, templateUrl=? WHERE id=?`,
            [
                business.name,
                business.logoUrl,
                business.phoneNumber,
                business.address,
                business.taxId,
                business.defaultNetDays,
                JSON.stringify(business.expenseCategories),
                JSON.stringify(business.theming),
                business.templateUrl,
                req.params.id
            ]
        );
        res.json(business);
    } catch (error) {
        res.status(400).json({ error: error });
    }
});

router.delete('/:id', async (req, res) => {
    const db = await getDb();
    await db.run('DELETE FROM businesses WHERE id = ?', req.params.id);
    res.json({ success: true });
});

export default router;
