import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = Router();

// Todas las rutas de admin requieren autenticación
router.use(authenticateAdmin);

// ============================================
// 📊 DASHBOARD
// ============================================

/**
 * GET /api/admin/dashboard
 * Obtiene estadísticas del dashboard
 */
router.get('/dashboard', async (req: Request, res: Response) => {
    try {
        const restaurantId = (req as any).user?.restaurantId;
        const today = new Date().toISOString().split('T')[0];

        // Reservas de hoy
        const { count: reservasHoy } = await supabaseAdmin
            .from('reservations')
            .select('*', { count: 'exact', head: true })
            .eq('restaurant_id', restaurantId)
            .eq('date', today)
            .in('status', ['pending', 'confirmed', 'arrived']);

        // Mesas ocupadas
        const { count: mesasOcupadas } = await supabaseAdmin
            .from('tables')
            .select('*', { count: 'exact', head: true })
            .eq('restaurant_id', restaurantId)
            .eq('status', 'occupied');

        // Total mesas
        const { count: totalMesas } = await supabaseAdmin
            .from('tables')
            .select('*', { count: 'exact', head: true })
            .eq('restaurant_id', restaurantId);

        // Ingresos por anticipos (mes actual)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        const { data: anticipos } = await supabaseAdmin
            .from('reservations')
            .select('deposit_amount')
            .eq('restaurant_id', restaurantId)
            .eq('deposit_paid', true)
            .gte('created_at', startOfMonth.toISOString());

        const ingresosAnticipos = anticipos?.reduce((sum, r) => sum + (r.deposit_amount || 0), 0) || 0;

        // Calificación promedio
        const { data: reviews } = await supabaseAdmin
            .from('reviews')
            .select('rating')
            .eq('restaurant_id', restaurantId);

        const calificacionPromedio = reviews?.length
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        // Reservas pendientes (total)
        const { count: reservasPendientes } = await supabaseAdmin
            .from('reservations')
            .select('*', { count: 'exact', head: true })
            .eq('restaurant_id', restaurantId)
            .eq('status', 'pending');

        const ocupacionActual = totalMesas && totalMesas > 0
            ? Math.round((mesasOcupadas || 0) / totalMesas * 100)
            : 0;

        res.json({
            success: true,
            data: {
                reservas_hoy: reservasHoy || 0,
                reservas_pendientes: reservasPendientes || 0,
                mesas_ocupadas: mesasOcupadas || 0,
                total_mesas: totalMesas || 0,
                ocupacion_actual: ocupacionActual,
                ingresos_anticipos: ingresosAnticipos,
                calificacion_promedio: Math.round(calificacionPromedio * 10) / 10,
                total_reviews: reviews?.length || 0
            }
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ success: false, error: 'Error al cargar dashboard' });
    }
});

// ============================================
// 📅 RESERVAS
// ============================================

/**
 * GET /api/admin/reservas
 * Lista reservas con filtros
 */
router.get('/reservas', async (req: Request, res: Response) => {
    try {
        const restaurantId = (req as any).user?.restaurantId;
        const { fecha, status, limit = 50, offset = 0 } = req.query;

        let query = supabaseAdmin
            .from('reservations')
            .select(`
                *,
                users:user_id (name, email, phone),
                tables:table_id (number, capacity)
            `, { count: 'exact' })
            .eq('restaurant_id', restaurantId)
            .order('date', { ascending: true })
            .order('time', { ascending: true });

        // Filtro por fecha
        if (fecha === 'hoy') {
            query = query.eq('date', new Date().toISOString().split('T')[0]);
        } else if (fecha === 'manana') {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            query = query.eq('date', tomorrow.toISOString().split('T')[0]);
        } else if (fecha && typeof fecha === 'string') {
            query = query.eq('date', fecha);
        }

        // Filtro por estado
        if (status && typeof status === 'string') {
            query = query.eq('status', status);
        }

        query = query.range(Number(offset), Number(offset) + Number(limit) - 1);

        const { data: reservas, error, count } = await query;

        if (error) throw error;

        res.json({
            success: true,
            data: reservas,
            total: count,
            limit: Number(limit),
            offset: Number(offset)
        });
    } catch (error) {
        console.error('Reservas error:', error);
        res.status(500).json({ success: false, error: 'Error al cargar reservas' });
    }
});

/**
 * PATCH /api/admin/reservas/:id/aceptar
 * Confirma una reserva
 */
router.patch('/reservas/:id/aceptar', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const restaurantId = (req as any).user?.restaurantId;

        const { data, error } = await supabaseAdmin
            .from('reservations')
            .update({ status: 'confirmed', updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('restaurant_id', restaurantId)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, data, message: 'Reserva confirmada' });
    } catch (error) {
        console.error('Aceptar reserva error:', error);
        res.status(500).json({ success: false, error: 'Error al confirmar reserva' });
    }
});

/**
 * PATCH /api/admin/reservas/:id/cancelar
 * Cancela una reserva
 */
router.patch('/reservas/:id/cancelar', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const restaurantId = (req as any).user?.restaurantId;
        const { reason } = req.body;

        const { data, error } = await supabaseAdmin
            .from('reservations')
            .update({
                status: 'cancelled',
                cancelled_at: new Date().toISOString(),
                cancellation_reason: reason || 'Cancelada por el restaurante',
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('restaurant_id', restaurantId)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, data, message: 'Reserva cancelada' });
    } catch (error) {
        console.error('Cancelar reserva error:', error);
        res.status(500).json({ success: false, error: 'Error al cancelar reserva' });
    }
});

/**
 * PATCH /api/admin/reservas/:id/checkin
 * Marca llegada del cliente
 */
router.patch('/reservas/:id/checkin', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const restaurantId = (req as any).user?.restaurantId;

        const { data, error } = await supabaseAdmin
            .from('reservations')
            .update({
                status: 'arrived',
                arrived_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('restaurant_id', restaurantId)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, data, message: 'Check-in registrado' });
    } catch (error) {
        console.error('Check-in error:', error);
        res.status(500).json({ success: false, error: 'Error en check-in' });
    }
});

// ============================================
// 🪑 MESAS
// ============================================

/**
 * GET /api/admin/mesas
 * Lista todas las mesas del restaurante
 */
router.get('/mesas', async (req: Request, res: Response) => {
    try {
        const restaurantId = (req as any).user?.restaurantId;

        const { data: mesas, error } = await supabaseAdmin
            .from('tables')
            .select('*')
            .eq('restaurant_id', restaurantId)
            .order('number', { ascending: true });

        if (error) throw error;

        res.json({ success: true, data: mesas });
    } catch (error) {
        console.error('Mesas error:', error);
        res.status(500).json({ success: false, error: 'Error al cargar mesas' });
    }
});

/**
 * POST /api/admin/mesas
 * Crea una nueva mesa
 */
router.post('/mesas', async (req: Request, res: Response) => {
    try {
        const restaurantId = (req as any).user?.restaurantId;
        const { number, capacity, shape, position_x, position_y, zone, is_vip } = req.body;

        const { data, error } = await supabaseAdmin
            .from('tables')
            .insert({
                restaurant_id: restaurantId,
                number,
                capacity,
                shape: shape || 'round',
                position_x: position_x || 0,
                position_y: position_y || 0,
                zone: zone || 'main',
                is_vip: is_vip || false,
                status: 'available'
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ success: true, data, message: 'Mesa creada' });
    } catch (error) {
        console.error('Crear mesa error:', error);
        res.status(500).json({ success: false, error: 'Error al crear mesa' });
    }
});

/**
 * PATCH /api/admin/mesas/:id
 * Actualiza estado o propiedades de una mesa
 */
router.patch('/mesas/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const restaurantId = (req as any).user?.restaurantId;
        const updates = req.body;

        const { data, error } = await supabaseAdmin
            .from('tables')
            .update(updates)
            .eq('id', id)
            .eq('restaurant_id', restaurantId)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, data, message: 'Mesa actualizada' });
    } catch (error) {
        console.error('Actualizar mesa error:', error);
        res.status(500).json({ success: false, error: 'Error al actualizar mesa' });
    }
});

/**
 * DELETE /api/admin/mesas/:id
 * Elimina una mesa
 */
router.delete('/mesas/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const restaurantId = (req as any).user?.restaurantId;

        const { error } = await supabaseAdmin
            .from('tables')
            .delete()
            .eq('id', id)
            .eq('restaurant_id', restaurantId);

        if (error) throw error;

        res.json({ success: true, message: 'Mesa eliminada' });
    } catch (error) {
        console.error('Eliminar mesa error:', error);
        res.status(500).json({ success: false, error: 'Error al eliminar mesa' });
    }
});

// ============================================
// 🧍 LISTA DE ESPERA
// ============================================

/**
 * GET /api/admin/waitlist/summary
 * Resumen de lista de espera
 */
router.get('/waitlist/summary', async (req: Request, res: Response) => {
    try {
        const restaurantId = (req as any).user?.restaurantId;

        const { data, error } = await supabaseAdmin
            .from('waitlist')
            .select('status')
            .eq('restaurant_id', restaurantId)
            .gte('created_at', new Date().toISOString().split('T')[0]);

        if (error) throw error;

        const summary = {
            waiting: data?.filter(w => w.status === 'waiting').length || 0,
            notified: data?.filter(w => w.status === 'notified').length || 0,
            seated: data?.filter(w => w.status === 'seated').length || 0,
            total: data?.length || 0
        };

        res.json({ success: true, data: summary });
    } catch (error) {
        console.error('Waitlist summary error:', error);
        res.status(500).json({ success: false, error: 'Error al cargar resumen' });
    }
});

/**
 * GET /api/admin/waitlist
 * Lista de espera completa
 */
router.get('/waitlist', async (req: Request, res: Response) => {
    try {
        const restaurantId = (req as any).user?.restaurantId;

        const { data, error } = await supabaseAdmin
            .from('waitlist')
            .select('*')
            .eq('restaurant_id', restaurantId)
            .in('status', ['waiting', 'notified'])
            .order('created_at', { ascending: true });

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        console.error('Waitlist error:', error);
        res.status(500).json({ success: false, error: 'Error al cargar lista de espera' });
    }
});

/**
 * POST /api/admin/waitlist
 * Agregar a lista de espera
 */
router.post('/waitlist', async (req: Request, res: Response) => {
    try {
        const restaurantId = (req as any).user?.restaurantId;
        const { name, phone, party_size, notes } = req.body;

        const { data, error } = await supabaseAdmin
            .from('waitlist')
            .insert({
                restaurant_id: restaurantId,
                name,
                phone,
                party_size,
                notes,
                status: 'waiting',
                estimated_wait: 15
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ success: true, data, message: 'Agregado a lista de espera' });
    } catch (error) {
        console.error('Agregar waitlist error:', error);
        res.status(500).json({ success: false, error: 'Error al agregar a lista' });
    }
});

/**
 * PATCH /api/admin/waitlist/:id/atender
 * Marca como atendido en lista de espera
 */
router.patch('/waitlist/:id/atender', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const restaurantId = (req as any).user?.restaurantId;
        const { table_id } = req.body;

        const { data, error } = await supabaseAdmin
            .from('waitlist')
            .update({
                status: 'seated',
                seated_at: new Date().toISOString(),
                table_id
            })
            .eq('id', id)
            .eq('restaurant_id', restaurantId)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, data, message: 'Cliente atendido' });
    } catch (error) {
        console.error('Atender waitlist error:', error);
        res.status(500).json({ success: false, error: 'Error al marcar como atendido' });
    }
});

// ============================================
// 🎯 OFERTAS
// ============================================

/**
 * GET /api/admin/ofertas
 * Lista todas las ofertas del restaurante
 */
router.get('/ofertas', async (req: Request, res: Response) => {
    try {
        const restaurantId = (req as any).user?.restaurantId;

        const { data, error } = await supabaseAdmin
            .from('offers')
            .select('*')
            .eq('restaurant_id', restaurantId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        console.error('Ofertas error:', error);
        res.status(500).json({ success: false, error: 'Error al cargar ofertas' });
    }
});

/**
 * POST /api/admin/ofertas
 * Crear nueva oferta
 */
router.post('/ofertas', async (req: Request, res: Response) => {
    try {
        const restaurantId = (req as any).user?.restaurantId;
        const {
            title, description, discount_type, discount_value,
            valid_from, valid_until, promo_code, terms_conditions
        } = req.body;

        const { data, error } = await supabaseAdmin
            .from('offers')
            .insert({
                restaurant_id: restaurantId,
                title,
                description,
                discount_type: discount_type || 'percentage',
                discount_value,
                valid_from: valid_from || new Date().toISOString().split('T')[0],
                valid_until,
                promo_code,
                terms_conditions,
                is_active: true
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ success: true, data, message: 'Oferta creada' });
    } catch (error) {
        console.error('Crear oferta error:', error);
        res.status(500).json({ success: false, error: 'Error al crear oferta' });
    }
});

/**
 * PATCH /api/admin/ofertas/:id
 * Actualizar oferta (activar/desactivar)
 */
router.patch('/ofertas/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const restaurantId = (req as any).user?.restaurantId;
        const updates = req.body;

        const { data, error } = await supabaseAdmin
            .from('offers')
            .update(updates)
            .eq('id', id)
            .eq('restaurant_id', restaurantId)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, data, message: 'Oferta actualizada' });
    } catch (error) {
        console.error('Actualizar oferta error:', error);
        res.status(500).json({ success: false, error: 'Error al actualizar oferta' });
    }
});

/**
 * DELETE /api/admin/ofertas/:id
 * Eliminar oferta
 */
router.delete('/ofertas/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const restaurantId = (req as any).user?.restaurantId;

        const { error } = await supabaseAdmin
            .from('offers')
            .delete()
            .eq('id', id)
            .eq('restaurant_id', restaurantId);

        if (error) throw error;

        res.json({ success: true, message: 'Oferta eliminada' });
    } catch (error) {
        console.error('Eliminar oferta error:', error);
        res.status(500).json({ success: false, error: 'Error al eliminar oferta' });
    }
});

// ============================================
// 🍽️ MENÚ
// ============================================

/**
 * GET /api/admin/menu
 * Lista todos los platillos del menú
 */
router.get('/menu', async (req: Request, res: Response) => {
    try {
        const restaurantId = (req as any).user?.restaurantId;

        const { data, error } = await supabaseAdmin
            .from('menu_items')
            .select('*')
            .eq('restaurant_id', restaurantId)
            .order('category', { ascending: true })
            .order('sort_order', { ascending: true });

        if (error) throw error;

        // Agrupar por categoría
        const menuByCategory = data?.reduce((acc: any, item) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
            return acc;
        }, {});

        res.json({ success: true, data, grouped: menuByCategory });
    } catch (error) {
        console.error('Menu error:', error);
        res.status(500).json({ success: false, error: 'Error al cargar menú' });
    }
});

/**
 * POST /api/admin/menu
 * Agregar platillo al menú
 */
router.post('/menu', async (req: Request, res: Response) => {
    try {
        const restaurantId = (req as any).user?.restaurantId;

        const {
            name, description, price, category,
            image_url, is_highlighted, is_vegetarian, is_vegan
        } = req.body;

        const { data, error } = await supabaseAdmin
            .from('menu_items')
            .insert({
                restaurant_id: restaurantId,
                name,
                description,
                price,
                category,
                image_url,
                is_highlighted: is_highlighted || false,
                is_vegetarian: is_vegetarian || false,
                is_vegan: is_vegan || false,
                is_available: true
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase Insert Error:', error);
            throw error;
        }

        res.status(201).json({ success: true, data, message: 'Platillo agregado' });
    } catch (error) {
        console.error('Crear platillo error:', error);
        res.status(500).json({ success: false, error: 'Error al agregar platillo' });
    }
});

/**
 * PATCH /api/admin/menu/:id
 * Actualizar platillo
 */
router.patch('/menu/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const restaurantId = (req as any).user?.restaurantId;
        const updates = req.body;

        const { data, error } = await supabaseAdmin
            .from('menu_items')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('restaurant_id', restaurantId)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, data, message: 'Platillo actualizado' });
    } catch (error) {
        console.error('Actualizar platillo error:', error);
        res.status(500).json({ success: false, error: 'Error al actualizar platillo' });
    }
});

/**
 * DELETE /api/admin/menu/:id
 * Eliminar platillo
 */
router.delete('/menu/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const restaurantId = (req as any).user?.restaurantId;

        const { error } = await supabaseAdmin
            .from('menu_items')
            .delete()
            .eq('id', id)
            .eq('restaurant_id', restaurantId);

        if (error) throw error;

        res.json({ success: true, message: 'Platillo eliminado' });
    } catch (error) {
        console.error('Eliminar platillo error:', error);
        res.status(500).json({ success: false, error: 'Error al eliminar platillo' });
    }
});

// ============================================
// ⭐ OPINIONES
// ============================================

/**
 * GET /api/admin/opiniones
 * Lista opiniones del restaurante
 */
router.get('/opiniones', async (req: Request, res: Response) => {
    try {
        const restaurantId = (req as any).user?.restaurantId;

        const { data, error } = await supabaseAdmin
            .from('reviews')
            .select(`
                *,
                users:user_id (name, avatar_url)
            `)
            .eq('restaurant_id', restaurantId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        console.error('Opiniones error:', error);
        res.status(500).json({ success: false, error: 'Error al cargar opiniones' });
    }
});

/**
 * POST /api/admin/opiniones/:id/respuesta
 * Responder a una opinión
 */
router.post('/opiniones/:id/respuesta', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const restaurantId = (req as any).user?.restaurantId;
        const userId = (req as any).user?.id;
        const { response } = req.body;

        const { data, error } = await supabaseAdmin
            .from('reviews')
            .update({
                response,
                responded_at: new Date().toISOString(),
                responded_by: userId
            })
            .eq('id', id)
            .eq('restaurant_id', restaurantId)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, data, message: 'Respuesta publicada' });
    } catch (error) {
        console.error('Responder opinión error:', error);
        res.status(500).json({ success: false, error: 'Error al responder' });
    }
});

// ============================================
// ⚙️ CONFIGURACIÓN
// ============================================

/**
 * GET /api/admin/configuracion
 * Cargar configuración del restaurante
 */
router.get('/configuracion', async (req: Request, res: Response) => {
    try {
        const restaurantId = (req as any).user?.restaurantId;

        const { data, error } = await supabaseAdmin
            .from('restaurants')
            .select('*')
            .eq('id', restaurantId)
            .single();

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        console.error('Configuración error:', error);
        res.status(500).json({ success: false, error: 'Error al cargar configuración' });
    }
});

/**
 * PUT /api/admin/configuracion
 * Guardar configuración del restaurante
 */
router.put('/configuracion', async (req: Request, res: Response) => {
    try {
        const restaurantId = (req as any).user?.restaurantId;
        const updates = req.body;

        // No permitir cambiar campos sensibles
        delete updates.id;
        delete updates.owner_id;
        delete updates.created_at;

        const { data, error } = await supabaseAdmin
            .from('restaurants')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', restaurantId)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, data, message: 'Configuración guardada' });
    } catch (error) {
        console.error('Guardar configuración error:', error);
        res.status(500).json({ success: false, error: 'Error al guardar configuración' });
    }
});

// ============================================
// 📈 REPORTES
// ============================================

/**
 * GET /api/admin/reportes
 * Obtiene datos históricos para reportes
 */
router.get('/reportes', async (req: Request, res: Response) => {
    try {
        const restaurantId = (req as any).user?.restaurantId;
        const { period = 'month' } = req.query; // week, month, quarter

        // Calcular rango de fechas
        const endDate = new Date();
        const startDate = new Date();

        if (period === 'week') startDate.setDate(endDate.getDate() - 7);
        else if (period === 'quarter') startDate.setMonth(endDate.getMonth() - 3);
        else startDate.setMonth(endDate.getMonth() - 1); // default month

        // Obtener reservaciones en el rango
        const { data: reservations, error } = await supabaseAdmin
            .from('reservations')
            .select('*')
            .eq('restaurant_id', restaurantId)
            .gte('date', startDate.toISOString().split('T')[0])
            .lte('date', endDate.toISOString().split('T')[0]);

        if (error) throw error;

        // Procesar datos para gráficas (agrupados por día)
        const dailyStats: Record<string, { reservations: number, occupancy: number, revenue: number }> = {};

        // Inicializar días
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dayStr = d.toISOString().split('T')[0];
            dailyStats[dayStr] = { reservations: 0, occupancy: 0, revenue: 0 };
        }

        reservations?.forEach(res => {
            if (dailyStats[res.date]) {
                dailyStats[res.date].reservations++;
                if (res.status === 'confirmed' || res.status === 'arrived') {
                    // Estimación simple de ocupación y revenue
                    dailyStats[res.date].occupancy += (res.party_size || 2) * 5; // 5% por persona (mock)
                    // Revenue = depósito + estimado consumo persona ($300)
                    const deposit = res.deposit_paid ? (res.deposit_amount || 0) : 0;
                    const estimatedSpend = (res.party_size || 2) * 300;
                    dailyStats[res.date].revenue += deposit + estimatedSpend;
                }
            }
        });

        // Formatear para frontend
        const weeklyData = Object.entries(dailyStats).map(([date, stats]) => ({
            day: new Date(date).toLocaleDateString('es-MX', { weekday: 'short' }),
            date,
            occupancy: Math.min(Math.round(stats.occupancy), 100),
            reservations: stats.reservations,
            revenue: stats.revenue
        }));

        res.json({ success: true, data: weeklyData });
    } catch (error) {
        console.error('Reportes error:', error);
        res.status(500).json({ success: false, error: 'Error al generar reportes' });
    }
});

// ============================================
// 🤖 IA SUGERENCIAS
// ============================================

/**
 * GET /api/admin/ia-sugerencias
 * Genera sugerencias basadas en reglas
 */
router.get('/ia-sugerencias', async (req: Request, res: Response) => {
    try {
        const restaurantId = (req as any).user?.restaurantId;

        // 1. Analizar ocupación reciente
        const today = new Date().toISOString().split('T')[0];
        const { count: reservasHoy } = await supabaseAdmin
            .from('reservations')
            .select('*', { count: 'exact', head: true })
            .eq('restaurant_id', restaurantId)
            .eq('date', today);

        // 2. Analizar opiniones bajas
        const { data: lowReviews } = await supabaseAdmin
            .from('reviews')
            .select('rating, comment')
            .eq('restaurant_id', restaurantId)
            .lt('rating', 3)
            .limit(5);

        const suggestions = [];

        // Regla 1: Ocupación baja hoy
        if ((reservasHoy || 0) < 5) {
            suggestions.push({
                id: 'auto-1',
                category: 'marketing',
                title: 'Baja ocupación hoy',
                description: 'Tienes pocas reservas para hoy. Considera lanzar una "Oferta Flash" del 15% para atraer comensales de última hora.',
                priority: 'alta',
                confidence: 90,
                estimatedImpact: '+5-10 reservas',
                actionLabel: 'Crear oferta',
                isApplied: false,
                createdAt: new Date().toISOString()
            });
        }

        // Regla 2: Ocupación alta (futura mejora)
        if ((reservasHoy || 0) > 20) {
            suggestions.push({
                id: 'auto-2',
                category: 'operacion',
                title: 'Alta demanda detectada',
                description: 'Hoy será un día ocupado. Asegúrate de tener personal suficiente en cocina y sala.',
                priority: 'media',
                confidence: 85,
                estimatedImpact: 'Mejora servicio',
                actionLabel: 'Ver staff',
                isApplied: false,
                createdAt: new Date().toISOString()
            });
        }

        // Regla 3: Reviews negativas recientes
        if (lowReviews && lowReviews.length > 0) {
            suggestions.push({
                id: 'auto-3',
                category: 'calidad',
                title: 'Atención a críticas recientes',
                description: `Tienes ${lowReviews.length} reseñas recientes con baja calificación. Es vital responderles para mantener tu reputación.`,
                priority: 'alta',
                confidence: 95,
                estimatedImpact: 'Retención clientes',
                actionLabel: 'Ver opiniones',
                isApplied: false,
                createdAt: new Date().toISOString()
            });
        }

        // Sugerencia Default si no hay nada crítico
        if (suggestions.length === 0) {
            suggestions.push({
                id: 'auto-def',
                category: 'general',
                title: 'Todo marcha bien',
                description: 'Tu restaurante opera dentro de parámetros normales. ¡Sigue así!',
                priority: 'baja',
                confidence: 100,
                estimatedImpact: 'Estabilidad',
                actionLabel: 'Ver dashboard',
                isApplied: false,
                createdAt: new Date().toISOString()
            });
        }

        res.json({ success: true, data: suggestions });
    } catch (error) {
        console.error('IA Sugerencias error:', error);
        res.status(500).json({ success: false, error: 'Error al generar sugerencias' });
    }
});

// ============================================
// 👥 STAFF
// ============================================

/**
 * GET /api/admin/usuarios
 * Lista staff del restaurante
 */
router.get('/usuarios', async (req: Request, res: Response) => {
    try {
        const restaurantId = (req as any).user?.restaurantId;

        const { data, error } = await supabaseAdmin
            .from('restaurant_staff')
            .select(`
                *,
                users:user_id (id, name, email, phone, avatar_url)
            `)
            .eq('restaurant_id', restaurantId);

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        console.error('Staff error:', error);
        res.status(500).json({ success: false, error: 'Error al cargar staff' });
    }
});

/**
 * POST /api/admin/usuarios
 * Crear usuario staff
 */
router.post('/usuarios', async (req: Request, res: Response) => {
    try {
        const restaurantId = (req as any).user?.restaurantId;
        const { email, name, phone, role, permissions } = req.body;

        // Primero crear el usuario
        const bcrypt = await import('bcryptjs');
        const passwordHash = await bcrypt.hash('temp123', 10);

        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .insert({
                email,
                name,
                phone,
                role: 'staff',
                password_hash: passwordHash
            })
            .select()
            .single();

        if (userError) throw userError;

        // Luego vincularlo al restaurante
        const { data: staffRecord, error: staffError } = await supabaseAdmin
            .from('restaurant_staff')
            .insert({
                restaurant_id: restaurantId,
                user_id: user.id,
                staff_role: role || 'waiter',
                permissions: permissions || {
                    canViewReservations: true,
                    canCheckIn: true,
                    canChangeTables: true
                }
            })
            .select()
            .single();

        if (staffError) throw staffError;

        res.status(201).json({
            success: true,
            data: { ...staffRecord, user },
            message: 'Staff creado. Contraseña temporal: temp123'
        });
    } catch (error) {
        console.error('Crear staff error:', error);
        res.status(500).json({ success: false, error: 'Error al crear staff' });
    }
});

/**
 * PATCH /api/admin/usuarios/:id
 * Actualizar permisos o rol de staff
 */
router.patch('/usuarios/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const restaurantId = (req as any).user?.restaurantId;
        const { staff_role, permissions, is_active } = req.body;

        const updates: any = {};
        if (staff_role) updates.staff_role = staff_role;
        if (permissions) updates.permissions = permissions;
        if (typeof is_active === 'boolean') updates.is_active = is_active;

        const { data, error } = await supabaseAdmin
            .from('restaurant_staff')
            .update(updates)
            .eq('id', id)
            .eq('restaurant_id', restaurantId)
            .select(`
                *,
                users:user_id (id, name, email, phone, avatar_url)
            `)
            .single();

        if (error) throw error;

        res.json({ success: true, data, message: 'Staff actualizado' });
    } catch (error) {
        console.error('Actualizar staff error:', error);
        res.status(500).json({ success: false, error: 'Error al actualizar staff' });
    }
});

/**
 * DELETE /api/admin/usuarios/:id
 * Eliminar staff del restaurante
 */
router.delete('/usuarios/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const restaurantId = (req as any).user?.restaurantId;

        // Solo elimina la relación, no el usuario
        const { error } = await supabaseAdmin
            .from('restaurant_staff')
            .delete()
            .eq('id', id)
            .eq('restaurant_id', restaurantId);

        if (error) throw error;

        res.json({ success: true, message: 'Staff eliminado del restaurante' });
    } catch (error) {
        console.error('Eliminar staff error:', error);
        res.status(500).json({ success: false, error: 'Error al eliminar staff' });
    }
});

export default router;
