import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { optionalAuthMiddleware } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/restaurants
 * Get all restaurants with optional filters
 */
router.get('/', optionalAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const {
            search,
            zone,
            cuisine,
            priceRange,
            isOpen,
            hasOffers,
            limit = 20,
            offset = 0
        } = req.query;

        let query = supabase
            .from('restaurants')
            .select('*', { count: 'exact' })
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        // Apply filters
        if (search && typeof search === 'string') {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,cuisine_type.ilike.%${search}%`);
        }

        if (zone && zone !== 'Todos' && typeof zone === 'string') {
            query = query.eq('zone', zone);
        }

        if (cuisine && cuisine !== 'Todos' && typeof cuisine === 'string') {
            query = query.eq('cuisine_type', cuisine);
        }

        if (priceRange && typeof priceRange === 'string') {
            query = query.eq('price_range', priceRange);
        }

        // Pagination
        query = query.range(Number(offset), Number(offset) + Number(limit) - 1);

        const { data: restaurants, error, count } = await query;

        if (error) {
            console.error('Error fetching restaurants:', error);
            res.status(500).json({
                success: false,
                error: 'Error fetching restaurants',
            });
            return;
        }

        res.json({
            success: true,
            data: restaurants,
            total: count,
            limit: Number(limit),
            offset: Number(offset),
        });
    } catch (error) {
        console.error('Restaurants route error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

/**
 * GET /api/restaurants/featured
 * Get featured restaurants (high rating)
 */
router.get('/featured', async (req: Request, res: Response) => {
    try {
        const { data: restaurants, error } = await supabase
            .from('restaurants')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(4);

        if (error) {
            console.error('Error fetching featured restaurants:', error);
            res.status(500).json({
                success: false,
                error: 'Error fetching featured restaurants',
            });
            return;
        }

        res.json({
            success: true,
            data: restaurants,
        });
    } catch (error) {
        console.error('Featured restaurants route error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

/**
 * GET /api/restaurants/:id
 * Get restaurant by ID with related data
 */
router.get('/:id', optionalAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { data: restaurant, error } = await supabase
            .from('restaurants')
            .select(`
        *,
        tables (*),
        offers (*)
      `)
            .eq('id', id)
            .single();

        if (error || !restaurant) {
            res.status(404).json({
                success: false,
                error: 'Restaurant not found',
            });
            return;
        }

        // Get reviews separately with user info
        const { data: reviews } = await supabase
            .from('reviews')
            .select(`
        *,
        users (id, name, avatar_url)
      `)
            .eq('restaurant_id', id)
            .order('created_at', { ascending: false })
            .limit(10);

        // Calculate average rating
        let averageRating = 0;
        if (reviews && reviews.length > 0) {
            const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
            averageRating = totalRating / reviews.length;
        }

        res.json({
            success: true,
            data: {
                ...restaurant,
                reviews: reviews || [],
                averageRating: Math.round(averageRating * 10) / 10,
                reviewCount: reviews?.length || 0,
            },
        });
    } catch (error) {
        console.error('Restaurant detail route error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

/**
 * GET /api/restaurants/:id/tables
 * Get tables for a restaurant
 */
router.get('/:id/tables', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { data: tables, error } = await supabase
            .from('tables')
            .select('*')
            .eq('restaurant_id', id)
            .order('number', { ascending: true });

        if (error) {
            console.error('Error fetching tables:', error);
            res.status(500).json({
                success: false,
                error: 'Error fetching tables',
            });
            return;
        }

        res.json({
            success: true,
            data: tables,
        });
    } catch (error) {
        console.error('Tables route error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

/**
 * GET /api/restaurants/:id/tables/available
 * Get available tables for a specific date, time, and guest count
 */
router.get('/:id/tables/available', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { date, time, guests } = req.query;

        if (!date || !time || !guests) {
            res.status(400).json({
                success: false,
                error: 'Date, time, and guests are required',
            });
            return;
        }

        const guestCount = parseInt(guests as string);

        // Get all tables for this restaurant that can fit the guests
        const { data: tables, error: tablesError } = await supabase
            .from('tables')
            .select('*')
            .eq('restaurant_id', id)
            .gte('capacity', guestCount)
            .order('number', { ascending: true });

        if (tablesError) {
            console.error('Error fetching tables:', tablesError);
            res.status(500).json({
                success: false,
                error: 'Error fetching tables',
            });
            return;
        }

        // Get reservations for this date and time (2-hour window)
        const reservationDate = date as string;
        const reservationTime = time as string;

        const { data: reservations, error: reservationsError } = await supabase
            .from('reservations')
            .select('table_id, status')
            .eq('restaurant_id', id)
            .eq('date', reservationDate)
            .in('status', ['pending', 'confirmed', 'arrived']);

        if (reservationsError) {
            console.error('Error fetching reservations:', reservationsError);
        }

        // Mark tables as available, reserved, or occupied
        const tablesWithStatus = tables.map(table => {
            const reservation = reservations?.find(r => r.table_id === table.id);

            let availabilityStatus = 'available';
            if (reservation) {
                if (reservation.status === 'arrived') {
                    availabilityStatus = 'occupied';
                } else {
                    availabilityStatus = 'reserved';
                }
            } else if (table.status === 'disabled') {
                availabilityStatus = 'blocked';
            }

            return {
                ...table,
                availability_status: availabilityStatus,
                is_selectable: availabilityStatus === 'available'
            };
        });

        res.json({
            success: true,
            data: tablesWithStatus,
            meta: {
                date: reservationDate,
                time: reservationTime,
                guests: guestCount,
                total_tables: tablesWithStatus.length,
                available_tables: tablesWithStatus.filter(t => t.availability_status === 'available').length
            }
        });
    } catch (error) {
        console.error('Available tables route error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

/**
 * GET /api/restaurants/:id/menu
 * Get menu items for a restaurant
 */
router.get('/:id/menu', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { data: menuItems, error } = await supabase
            .from('menu_items')
            .select('*')
            .eq('restaurant_id', id)
            .eq('is_available', true)
            .order('category', { ascending: true });

        if (error) {
            console.error('Error fetching menu:', error);
            res.status(500).json({
                success: false,
                error: 'Error fetching menu',
            });
            return;
        }

        res.json({
            success: true,
            data: menuItems,
        });
    } catch (error) {
        console.error('Menu route error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

/**
 * GET /api/restaurants/:id/offers
 * Get active offers for a restaurant
 */
router.get('/:id/offers', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const today = new Date().toISOString().split('T')[0];

        const { data: offers, error } = await supabase
            .from('offers')
            .select('*')
            .eq('restaurant_id', id)
            .eq('is_active', true)
            .gte('valid_until', today)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching offers:', error);
            res.status(500).json({
                success: false,
                error: 'Error fetching offers',
            });
            return;
        }

        res.json({
            success: true,
            data: offers,
        });
    } catch (error) {
        console.error('Offers route error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

export default router;
