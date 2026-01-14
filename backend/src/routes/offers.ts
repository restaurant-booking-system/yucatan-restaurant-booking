import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

/**
 * GET /api/offers
 * Get all active offers from all restaurants
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const { data: offers, error } = await supabase
            .from('offers')
            .select(`
                *,
                restaurants (id, name, image_url, cuisine_type, zone)
            `)
            .eq('is_active', true)
            .gte('valid_until', today)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching global offers:', error);
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
        console.error('Global offers route error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

export default router;
