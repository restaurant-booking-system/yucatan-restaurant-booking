import { Router, Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase.js';
import { authMiddleware } from '../middleware/auth.js';

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

/**
 * GET /api/restaurants/:restaurantId/offers
 * Get all offers for a specific restaurant (public)
 */
router.get('/restaurants/:restaurantId', async (req: Request, res: Response) => {
    try {
        const { restaurantId } = req.params;
        const today = new Date().toISOString().split('T')[0];

        const { data: offers, error } = await supabase
            .from('offers')
            .select('*')
            .eq('restaurant_id', restaurantId)
            .eq('is_active', true)
            .gte('valid_until', today)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching restaurant offers:', error);
            res.status(500).json({
                success: false,
                error: 'Error fetching offers',
            });
            return;
        }

        res.json({
            success: true,
            data: offers || [],
        });
    } catch (error) {
        console.error('Restaurant offers route error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

/**
 * POST /api/restaurants/:restaurantId/offers
 * Create a new offer (admin only)
 */
router.post('/restaurants/:restaurantId', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { restaurantId } = req.params;
        const { title, description, discount, discountType, validFrom, validUntil } = req.body;

        // Verify user owns this restaurant
        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('owner_id')
            .eq('id', restaurantId)
            .single();

        if (!restaurant || restaurant.owner_id !== req.user!.id) {
            res.status(403).json({
                success: false,
                error: 'You do not have permission to create offers for this restaurant',
            });
            return;
        }

        const { data: offer, error } = await supabaseAdmin
            .from('offers')
            .insert({
                restaurant_id: restaurantId,
                title,
                description,
                discount_value: discount,
                discount_type: discountType || 'percentage',
                valid_from: validFrom || null,
                valid_until: validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 30 days
                is_active: true,
                usage_count: 0,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating offer:', JSON.stringify(error, null, 2));
            console.error('Attempted to insert:', { restaurant_id: restaurantId, title, description, discount, discount_type: discountType, valid_from: validFrom, valid_until: validUntil });
            res.status(500).json({
                success: false,
                error: 'Error creating offer',
                details: error.message || error.code || 'Unknown database error',
            });
            return;
        }

        res.json({
            success: true,
            data: offer,
            message: 'Offer created successfully',
        });
    } catch (error) {
        console.error('Create offer route error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

/**
 * PATCH /api/offers/:id
 * Update an offer (admin only)
 */
router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Get the offer to verify ownership
        const { data: offer } = await supabase
            .from('offers')
            .select('restaurant_id, restaurants(owner_id)')
            .eq('id', id)
            .single();

        if (!offer) {
            res.status(404).json({
                success: false,
                error: 'Offer not found',
            });
            return;
        }

        // Verify user owns the restaurant
        if ((offer.restaurants as any)?.owner_id !== req.user!.id) {
            res.status(403).json({
                success: false,
                error: 'You do not have permission to update this offer',
            });
            return;
        }

        // Update the offer
        const { data: updatedOffer, error } = await supabaseAdmin
            .from('offers')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating offer:', error);
            res.status(500).json({
                success: false,
                error: 'Error updating offer',
            });
            return;
        }

        res.json({
            success: true,
            data: updatedOffer,
            message: 'Offer updated successfully',
        });
    } catch (error) {
        console.error('Update offer route error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

/**
 * DELETE /api/offers/:id
 * Delete an offer (admin only)
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Get the offer to verify ownership
        const { data: offer } = await supabase
            .from('offers')
            .select('restaurant_id, restaurants(owner_id)')
            .eq('id', id)
            .single();

        if (!offer) {
            res.status(404).json({
                success: false,
                error: 'Offer not found',
            });
            return;
        }

        // Verify user owns the restaurant
        if ((offer.restaurants as any)?.owner_id !== req.user!.id) {
            res.status(403).json({
                success: false,
                error: 'You do not have permission to delete this offer',
            });
            return;
        }

        // Delete the offer
        const { error } = await supabaseAdmin
            .from('offers')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting offer:', error);
            res.status(500).json({
                success: false,
                error: 'Error deleting offer',
            });
            return;
        }

        res.json({
            success: true,
            message: 'Offer deleted successfully',
        });
    } catch (error) {
        console.error('Delete offer route error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

export default router;
