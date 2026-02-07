import request from 'supertest';
import app from '../app';
import { getDb } from '../db';

beforeAll(async () => {
    await getDb(); // Ensure DB is initialized
});

describe('API Routes', () => {
    describe('Businesses', () => {
        it('should create and retrieve a business', async () => {
            const newBusiness = {
                id: 'b-test-1',
                name: 'Test Corp',
                address: '123 Test St',
                taxId: '123',
                defaultNetDays: 30,
                expenseCategories: ['General'],
                theming: { primaryColor: '#000', secondaryColor: '#fff', layout: 'executive' }
            };

            const resEx = await request(app).post('/api/businesses').send(newBusiness);
            expect(resEx.status).toBe(200);
            expect(resEx.body.name).toBe('Test Corp');

            const resGet = await request(app).get('/api/businesses');
            expect(resGet.status).toBe(200);
            expect(resGet.body).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'b-test-1' })]));
        });
    });

    describe('Clients', () => {
        it('should create and retrieve a client', async () => {
            const newClient = {
                id: 'c-test-1',
                businessId: 'b-test-1',
                name: 'Client A',
                address: '456 Client Rd',
                representatives: []
            };

            const res = await request(app).post('/api/clients').send(newClient);
            expect(res.status).toBe(200);

            const resGet = await request(app).get('/api/clients?businessId=b-test-1');
            expect(resGet.status).toBe(200);
            expect(resGet.body).toHaveLength(1);
            expect(resGet.body[0].name).toBe('Client A');
        });
    });
});
