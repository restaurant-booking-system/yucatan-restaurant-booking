import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase, supabaseAdmin } from '../config/supabase.js';
import { env } from '../config/env.js';
import crypto from 'crypto';

const router = Router();



// ===========================================
// CUSTOMER AUTH
// ===========================================

// Customer Register
router.post('/customer/register', async (req: Request, res: Response) => {
    try {
        const { email, password, name, phone } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                error: 'Faltan campos obligatorios'
            });
        }

        // Check if user already exists in public.users
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', email.toLowerCase())
            .single();

        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Este correo ya está registrado'
            });
        }

        // Hash password (we'll store it in public.users for simplicity in this custom flow)
        // Note: In a production app with the schema provided, you'd use Supabase Auth.
        // But to make it work with the current backend-only flow, we'll ensure the table has what it needs.
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const { data: newUser, error: userError } = await supabaseAdmin
            .from('users')
            .insert({
                id: crypto.randomUUID(), // Using a random UUID since we're not using Supabase Auth yet
                name,
                email: email.toLowerCase(),
                phone: phone || '',
                password_hash: passwordHash, // We assume this column is added or we'll skip the hash if not
                role: 'customer',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select('*')
            .single();

        if (userError) {
            console.error('Error creating customer:', userError);
            return res.status(500).json({
                success: false,
                error: 'Error al crear la cuenta: ' + userError.message
            });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: newUser.id, email: newUser.email, role: newUser.role },
            env.jwtSecret,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            data: {
                user: newUser,
                token
            }
        });

    } catch (error) {
        console.error('Customer registration error:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
});

// Customer Login
router.post('/customer/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', email.toLowerCase())
            .limit(1)
            .single();

        if (error || !user) {
            return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password_hash || '');
        if (!validPassword) {
            return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            env.jwtSecret,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone
                },
                token
            }
        });

    } catch (error) {
        console.error('Customer login error:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
});

// ===========================================
// RESTAURANT AUTH
// ===========================================

// Restaurant Register
router.post('/restaurant/register', async (req: Request, res: Response) => {
    try {
        const { owner_name, email, phone, password, restaurant: restData } = req.body;

        if (!email || !password || !owner_name || !restData?.name) {
            return res.status(400).json({
                success: false,
                error: 'Faltan campos obligatorios'
            });
        }

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', email.toLowerCase())
            .single();

        let userId = '';
        let userToReturn = null;

        if (existingUser) {
            // 1a. User exists -> Verify password to allow 'Upgrade'
            const validPassword = await bcrypt.compare(password, existingUser.password_hash || '');

            if (!validPassword) {
                return res.status(400).json({
                    success: false,
                    error: 'Este correo ya está registrado y la contraseña no coincide'
                });
            }

            userId = existingUser.id;

            // Upgrade role if needed (customer -> restaurant_admin)
            if (existingUser.role === 'customer') {
                const { error: updateError } = await supabaseAdmin
                    .from('users')
                    .update({ role: 'restaurant_admin' })
                    .eq('id', userId);

                if (updateError) throw updateError;
                existingUser.role = 'restaurant_admin';
            }

            userToReturn = existingUser;

        } else {
            // 1b. Create New User
            userId = crypto.randomUUID();
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            const { data: newUser, error: userError } = await supabaseAdmin
                .from('users')
                .insert({
                    id: userId,
                    name: owner_name,
                    email: email.toLowerCase(),
                    phone: phone || '',
                    password_hash: passwordHash,
                    role: 'restaurant_admin',
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (userError) throw userError;
            userToReturn = newUser;
        }

        // 2. Create Restaurant
        const { data: restaurant, error: restError } = await supabaseAdmin
            .from('restaurants')
            .insert({
                id: crypto.randomUUID(),
                owner_id: userId,
                name: restData.name,
                description: restData.description || '',
                address: restData.address || '',
                zone: restData.zone || '',
                cuisine_type: restData.cuisine || '',
                price_range: restData.price_range || '$$',
                image_url: restData.image || '',
                open_time: restData.open_time || '09:00',
                close_time: restData.close_time || '22:00',
            })
            .select()
            .single();

        if (restError) {
            // Rollback user creation (optional but good)
            await supabase.from('users').delete().eq('id', userId);
            throw restError;
        }

        // Generate Token
        const token = jwt.sign(
            { userId: userToReturn.id, restaurantId: restaurant.id, email: userToReturn.email, role: userToReturn.role },
            env.jwtSecret,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            data: {
                user: userToReturn,
                restaurant,
                token
            }
        });

    } catch (error: any) {
        console.error('Restaurant registration error:', error);
        res.status(500).json({ success: false, error: error.message || 'Error al registrar el restaurante' });
    }
});

router.post('/restaurant/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email y contraseña son requeridos'
            });
        }

        // Check if user already exists
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', email.toLowerCase())
            .limit(1)
            .single();

        if (error || !user) {
            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas'
            });
        }

        // Verify if it's a restaurant admin
        if (user.role !== 'restaurant_admin' && user.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                error: 'No tienes permisos de administrador'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash || '');

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas'
            });
        }

        // Get the restaurant owned by this user
        const { data: restaurant } = await supabaseAdmin
            .from('restaurants')
            .select('*')
            .eq('owner_id', user.id)
            .single();

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                restaurantId: restaurant?.id,
                email: user.email,
                role: user.role
            },
            env.jwtSecret,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                restaurant: restaurant,
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// ===========================================
// VERIFY TOKEN
// ===========================================
router.get('/verify', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Token no proporcionado'
            });
        }

        const token = authHeader.split(' ')[1];

        // Decoded token might have different structures depending on source
        const decoded = jwt.verify(token, env.jwtSecret) as any;
        const userId = decoded.userId || decoded.id;

        // Get user profile from our users table
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error || !user) {
            return res.status(401).json({
                success: false,
                error: 'Token inválido'
            });
        }

        // If it's a restaurant admin, also fetch their restaurant
        let restaurant = null;
        if (user.role === 'restaurant_admin' || user.role === 'super_admin') {
            const { data: restData } = await supabase
                .from('restaurants')
                .select('*')
                .eq('owner_id', user.id)
                .single();
            restaurant = restData;
        }

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone
                },
                restaurant
            }
        });

    } catch (error) {
        console.error('Verify token error:', error);
        res.status(401).json({
            success: false,
            error: 'Token inválido o expirado'
        });
    }
});

export default router;
