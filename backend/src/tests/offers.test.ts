import request from 'supertest';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mocks
const mockData = jest.fn();
const mockError = jest.fn();

// Mock Supabase with robust chain
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockOrder = jest.fn();
const mockGte = jest.fn();
const mockFrom = jest.fn();

jest.mock('../config/supabase.js', () => ({
    supabase: {
        from: mockFrom
    }
}));

import app from '../index.js';

const setupSupabaseMock = () => {
    mockData.mockReturnValue(null);
    mockError.mockReturnValue(null);

    const promiseChain = {
        then: (resolve: any) => {
            const data = mockData();
            const error = mockError();
            resolve({ data, error, count: data?.length || 0 });
        }
    };

    const chain: any = { ...promiseChain };
    chain.select = mockSelect;
    chain.eq = mockEq;
    chain.gte = mockGte;
    chain.order = mockOrder;

    mockFrom.mockReturnValue(chain);
    mockSelect.mockReturnValue(chain);
    mockEq.mockReturnValue(chain);
    mockGte.mockReturnValue(chain);
    mockOrder.mockReturnValue(chain);
};

describe('Offers Endpoints', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupSupabaseMock();
    });

    describe('GET /api/offers', () => {
        it('should return active offers', async () => {
            const mockOffers = [{ id: '1', title: 'Promo 2x1' }];
            mockData.mockReturnValue(mockOffers);

            const res = await request(app).get('/api/offers');

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toEqual(mockOffers);
        });
    });
});
