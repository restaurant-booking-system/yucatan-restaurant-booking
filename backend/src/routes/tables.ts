import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = Router();

/**
 * PATCH /api/tables/:id/status
 * Update table status (available, occupied, reserved, maintenance)
 */
router.patch('/:id/status', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['available', 'occupied', 'reserved', 'maintenance'];
        if (!status || !validStatuses.includes(status)) {
            res.status(400).json({
                success: false,
                error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
            });
            return;
        }

        // Update table status
        const { data: table, error } = await supabaseAdmin
            .from('tables')
            .update({
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating table status:', error);
            res.status(500).json({
                success: false,
                error: 'Error updating table status',
            });
            return;
        }

        if (!table) {
            res.status(404).json({
                success: false,
                error: 'Table not found',
            });
            return;
        }

        res.json({
            success: true,
            data: table,
            message: `Table status updated to ${status}`,
        });
    } catch (error) {
        console.error('Update table status error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

/**
 * GET /api/tables/:id
 * Get table by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { data: table, error } = await supabaseAdmin
            .from('tables')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !table) {
            res.status(404).json({
                success: false,
                error: 'Table not found',
            });
            return;
        }

        res.json({
            success: true,
            data: table,
        });
    } catch (error) {
        console.error('Get table error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

export default router;
