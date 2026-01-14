import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { authMiddleware, staffMiddleware } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const router = Router();

/**
 * POST /api/staff/login
 * Staff login with email and password
 */
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password, restaurantId } = req.body;

        if (!email || !password) {
            res.status(400).json({
                success: false,
                error: 'Email y contraseña son requeridos',
            });
            return;
        }

        // Find user
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email.toLowerCase())
            .single();

        if (userError || !user) {
            res.status(401).json({
                success: false,
                error: 'Credenciales inválidas',
            });
            return;
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash || '');
        if (!isValidPassword) {
            res.status(401).json({
                success: false,
                error: 'Credenciales inválidas',
            });
            return;
        }

        // Check if user is staff
        if (user.role !== 'staff' && user.role !== 'restaurant_admin' && user.role !== 'super_admin') {
            res.status(403).json({
                success: false,
                error: 'No tienes permisos de staff',
            });
            return;
        }

        // Get staff's assigned restaurant(s)
        let restaurant = null;

        if (user.role === 'staff') {
            // Staff must be assigned to a restaurant
            const { data: staffRecord } = await supabase
                .from('restaurant_staff')
                .select(`
                    *,
                    restaurants (*)
                `)
                .eq('user_id', user.id)
                .eq('is_active', true)
                .single();

            if (!staffRecord) {
                res.status(403).json({
                    success: false,
                    error: 'No estás asignado a ningún restaurante',
                });
                return;
            }

            restaurant = staffRecord.restaurants;
        } else {
            // Admin - get their restaurant
            const { data: restData } = await supabase
                .from('restaurants')
                .select('*')
                .eq('owner_id', user.id)
                .single();

            restaurant = restData;
        }

        // Generate JWT
        const token = jwt.sign(
            {
                userId: user.id,
                restaurantId: restaurant?.id,
                email: user.email,
                role: user.role
            },
            env.jwtSecret,
            { expiresIn: '12h' } // Shorter expiry for staff
        );

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                restaurant,
                token,
            },
        });
    } catch (error) {
        console.error('Staff login error:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
        });
    }
});

/**
 * GET /api/staff/reservations/today
 * Get today's reservations for the staff's restaurant
 */
router.get('/reservations/today', authMiddleware, staffMiddleware, async (req: Request, res: Response) => {
    try {
        const restaurantId = req.query.restaurantId as string;

        if (!restaurantId) {
            res.status(400).json({
                success: false,
                error: 'Restaurant ID is required',
            });
            return;
        }

        const today = new Date().toISOString().split('T')[0];

        const { data: reservations, error } = await supabase
            .from('reservations')
            .select(`
                *,
                users (id, name, phone, email),
                tables (id, number, capacity)
            `)
            .eq('restaurant_id', restaurantId)
            .eq('date', today)
            .in('status', ['pending', 'confirmed', 'arrived'])
            .order('time', { ascending: true });

        if (error) {
            console.error('Error fetching reservations:', error);
            res.status(500).json({
                success: false,
                error: 'Error fetching reservations',
            });
            return;
        }

        res.json({
            success: true,
            data: reservations,
        });
    } catch (error) {
        console.error('Staff reservations error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

/**
 * PATCH /api/staff/reservations/:id/arrive
 * Mark a reservation as arrived (check-in)
 */
router.patch('/reservations/:id/arrive', authMiddleware, staffMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Update reservation status
        const { data: reservation, error } = await supabase
            .from('reservations')
            .update({
                status: 'arrived',
                arrived_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating reservation:', error);
            res.status(500).json({
                success: false,
                error: 'Error updating reservation',
            });
            return;
        }

        // Update table status to occupied
        if (reservation.table_id) {
            await supabase
                .from('tables')
                .update({ status: 'occupied' })
                .eq('id', reservation.table_id);
        }

        res.json({
            success: true,
            data: reservation,
            message: 'Cliente registrado exitosamente',
        });
    } catch (error) {
        console.error('Arrive error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

/**
 * PATCH /api/staff/tables/:id/status
 * Update table status (staff can only toggle between available/occupied)
 */
router.patch('/tables/:id/status', authMiddleware, staffMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Staff can only set available or occupied
        const allowedStatuses = ['available', 'occupied'];
        if (!allowedStatuses.includes(status)) {
            res.status(400).json({
                success: false,
                error: 'Staff solo puede cambiar entre disponible y ocupada',
            });
            return;
        }

        const { data: table, error } = await supabase
            .from('tables')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating table:', error);
            res.status(500).json({
                success: false,
                error: 'Error updating table',
            });
            return;
        }

        res.json({
            success: true,
            data: table,
        });
    } catch (error) {
        console.error('Table status error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

/**
 * GET /api/staff/tables
 * Get all tables for the restaurant
 */
router.get('/tables', authMiddleware, staffMiddleware, async (req: Request, res: Response) => {
    try {
        const restaurantId = req.query.restaurantId as string;

        if (!restaurantId) {
            res.status(400).json({
                success: false,
                error: 'Restaurant ID is required',
            });
            return;
        }

        const { data: tables, error } = await supabase
            .from('tables')
            .select('*')
            .eq('restaurant_id', restaurantId)
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
        console.error('Staff tables error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

export default router;
