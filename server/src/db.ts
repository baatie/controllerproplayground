import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

let db: Database;

export async function getDb() {
  if (!db) {
    db = await open({
      filename: process.env.DATABASE_PATH || './database.sqlite',
      driver: sqlite3.Database
    });
    await migrate(db);
  }
  return db;
}

async function migrate(db: Database) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS businesses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      logoUrl TEXT,
      phoneNumber TEXT,
      address TEXT NOT NULL,
      taxId TEXT NOT NULL,
      defaultNetDays INTEGER NOT NULL,
      expenseCategories TEXT NOT NULL,
      theming TEXT NOT NULL,
      templateUrl TEXT
    );

    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      businessId TEXT NOT NULL,
      name TEXT NOT NULL,
      representatives TEXT NOT NULL,
      address TEXT NOT NULL,
      FOREIGN KEY(businessId) REFERENCES businesses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      businessId TEXT NOT NULL,
      clientId TEXT NOT NULL,
      representativeId TEXT NOT NULL,
      items TEXT NOT NULL,
      issueDate TEXT NOT NULL,
      dueDate TEXT NOT NULL,
      status TEXT NOT NULL,
      total REAL NOT NULL,
      payments TEXT NOT NULL,
      customerPo TEXT,
      taxRate REAL,
      templateId TEXT,
      FOREIGN KEY(businessId) REFERENCES businesses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      businessId TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      vendor TEXT NOT NULL,
      projectId TEXT,
      invoiceId TEXT,
      receiptData TEXT,
      FOREIGN KEY(businessId) REFERENCES businesses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      businessId TEXT NOT NULL,
      name TEXT NOT NULL,
      totalBudget REAL NOT NULL,
      spent REAL NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY(businessId) REFERENCES businesses(id) ON DELETE CASCADE
    );
  `);
}
