import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDb } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-do-not-use-prod';

const AuthSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(6)
});

router.post('/register', async (req, res) => {
    try {
        const { username, password } = AuthSchema.parse(req.body);
        const db = await getDb();

        // Check existing
        const existing = await db.get('SELECT id FROM users WHERE username = ?', [username]);
        if (existing) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const id = uuidv4();

        await db.run(
            'INSERT INTO users (id, username, password) VALUES (?, ?, ?)',
            [id, username, hashedPassword]
        );

        res.status(201).json({ message: 'User registered successfully' });
    } catch (e) {
        if (e instanceof z.ZodError) {
            return res.status(400).json({ error: e.errors });
        }
        console.error('Registration failed:', e);
        res.status(500).json({ error: 'Registration failed' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const db = await getDb();

        const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, username: user.username });
    } catch (e) {
        console.error('Login failed:', e);
        res.status(500).json({ error: 'Login failed' });
    }
});

export default router;
