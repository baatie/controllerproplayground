import app from './app';
import { getDb } from './db';

const PORT = process.env.PORT || 3001;

async function start() {
    try {
        await getDb(); // Initialize DB
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (e) {
        console.error('Failed to start server:', e);
        process.exit(1);
    }
}

start();
