import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Calendar, Clock, Users, TrendingUp, TrendingDown, AlertCircle,
    DollarSign, Utensils, Check, X, ChevronRight, Bell,
    MoreHorizontal, Eye, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AdminLayout from '@/components/admin/AdminLayout';
import { cn } from '@/lib/utils';

// Mock data
const todayStats = {
    totalReservations: 24,
    confirmedReservations: 18,
    pendingReservations: 4,
    cancelledReservations: 2,
    currentOccupancy: 75,
    totalCapacity: 80,
    expectedRevenue: 45600,
    noShows: 1,
};

const peakHours = [
    { time: '12:00 - 14:00', occupancy: 45, isPeak: false },
    { time: '14:00 - 17:00', occupancy: 25, isPeak: false },
    { time: '19:00 - 21:00', occupancy: 95, isPeak: true },
    { time: '21:00 - 23:00', occupancy: 80, isPeak: true },
];

const upcomingReservations = [
    { id: '1', name: 'María García', time: '13:00', guests: 2, mesa: 3, status: 'confirmed' },
    { id: '2', name: 'Carlos López', time: '13:30', guests: 4, mesa: 5, status: 'pending' },
    { id: '3', name: 'Ana Martínez', time: '14:00', guests: 2, mesa: 1, status: 'confirmed' },
    { id: '4', name: 'Roberto Sánchez', time: '14:30', guests: 6, mesa: 7, status: 'pending' },
];

const alerts = [
    { id: '1', type: 'warning', message: 'Mesa 5 sin confirmación a 30 min de la reserva', time: '12:45' },
    { id: '2', type: 'info', message: 'Nueva reserva para las 20:00', time: '12:30' },
    { id: '3', type: 'success', message: 'Cliente llegó - Mesa 3', time: '12:15' },
];

const aiSuggestions = [
    'Basado en el historial, hoy podrías tener un 15% más de ocupación a las 20:00. Considera preparar más mesas.',
    'Los tiempos de espera aumentaron 10% esta semana. Revisa la asignación de personal.',
];

const RestaurantDashboard = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('today');
    const currentTime = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    const currentDate = new Date().toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-success text-success-foreground';
            case 'pending': return 'bg-warning text-warning-foreground';
            case 'cancelled': return 'bg-destructive text-destructive-foreground';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    const getAlertColor = (type: string) => {
        switch (type) {
            case 'warning': return 'border-warning bg-warning/10 text-warning';
            case 'success': return 'border-success bg-success/10 text-success';
            default: return 'border-primary bg-primary/10 text-primary';
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold">Dashboard</h1>
                        <p className="text-muted-foreground capitalize">
                            {currentDate} • {currentTime}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="gap-2">
                            <Bell className="w-4 h-4" />
                            <Badge className="bg-destructive text-xs">3</Badge>
                        </Button>
                        <Button asChild className="gap-2">
                            <Link to="/admin/reservas">
                                <Eye className="w-4 h-4" />
                                Ver Reservas
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card rounded-xl p-6 shadow-card"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-primary" />
                            </div>
                            <Badge variant="outline" className="gap-1">
                                <TrendingUp className="w-3 h-3" />
                                +12%
                            </Badge>
                        </div>
                        <p className="text-3xl font-bold">{todayStats.totalReservations}</p>
                        <p className="text-sm text-muted-foreground">Reservas hoy</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-card rounded-xl p-6 shadow-card"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-success" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold">{todayStats.currentOccupancy}%</p>
                        <p className="text-sm text-muted-foreground">Ocupación actual</p>
                        <Progress value={todayStats.currentOccupancy} className="mt-2 h-2" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-card rounded-xl p-6 shadow-card"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-secondary" />
                            </div>
                            <Badge variant="outline" className="gap-1">
                                <TrendingUp className="w-3 h-3" />
                                +8%
                            </Badge>
                        </div>
                        <p className="text-3xl font-bold">${(todayStats.expectedRevenue / 1000).toFixed(1)}k</p>
                        <p className="text-sm text-muted-foreground">Ingreso esperado</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-card rounded-xl p-6 shadow-card"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                                <Clock className="w-6 h-6 text-warning" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold">{todayStats.pendingReservations}</p>
                        <p className="text-sm text-muted-foreground">Pendientes de confirmar</p>
                    </motion.div>
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Upcoming Reservations */}
                    <div className="lg:col-span-2 bg-card rounded-xl p-6 shadow-card">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-display font-semibold">Próximas Reservas</h2>
                            <Button variant="ghost" size="sm" asChild>
                                <Link to="/admin/reservas" className="gap-1">
                                    Ver todas <ChevronRight className="w-4 h-4" />
                                </Link>
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {upcomingReservations.map((reservation, index) => (
                                <motion.div
                                    key={reservation.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center justify-between p-4 rounded-lg bg-background hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="text-center">
                                            <p className="text-lg font-bold">{reservation.time}</p>
                                        </div>
                                        <div>
                                            <p className="font-medium">{reservation.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {reservation.guests} personas • Mesa {reservation.mesa}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className={cn('capitalize', getStatusColor(reservation.status))}>
                                            {reservation.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                                        </Badge>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem className="gap-2">
                                                    <Check className="w-4 h-4" />
                                                    Confirmar llegada
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-2">
                                                    <Eye className="w-4 h-4" />
                                                    Ver detalles
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-2 text-destructive">
                                                    <X className="w-4 h-4" />
                                                    Cancelar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        {/* Peak Hours */}
                        <div className="bg-card rounded-xl p-6 shadow-card">
                            <h2 className="text-xl font-display font-semibold mb-4">Horarios Pico</h2>
                            <div className="space-y-3">
                                {peakHours.map((hour, index) => (
                                    <div key={index} className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className={hour.isPeak ? 'font-medium text-warning' : ''}>
                                                {hour.time} {hour.isPeak && '🔥'}
                                            </span>
                                            <span>{hour.occupancy}%</span>
                                        </div>
                                        <Progress
                                            value={hour.occupancy}
                                            className={cn('h-2', hour.isPeak && '[&>div]:bg-warning')}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Alerts */}
                        <div className="bg-card rounded-xl p-6 shadow-card">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-display font-semibold">Alertas</h2>
                                <Badge variant="outline">{alerts.length}</Badge>
                            </div>
                            <div className="space-y-3">
                                {alerts.map((alert) => (
                                    <div
                                        key={alert.id}
                                        className={cn(
                                            'p-3 rounded-lg border-l-4 text-sm',
                                            getAlertColor(alert.type)
                                        )}
                                    >
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p>{alert.message}</p>
                                                <p className="text-xs opacity-70 mt-1">{alert.time}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* AI Suggestions */}
                        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-6 border border-primary/20">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5 text-primary" />
                                <h2 className="text-lg font-display font-semibold">Sugerencias IA</h2>
                            </div>
                            <div className="space-y-3">
                                {aiSuggestions.map((suggestion, index) => (
                                    <p key={index} className="text-sm text-muted-foreground">
                                        {suggestion}
                                    </p>
                                ))}
                            </div>
                            <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                                <Link to="/admin/ia-sugerencias">Ver más sugerencias</Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-success/10 rounded-xl p-4 text-center">
                        <Check className="w-6 h-6 text-success mx-auto mb-2" />
                        <p className="text-2xl font-bold text-success">{todayStats.confirmedReservations}</p>
                        <p className="text-sm text-muted-foreground">Confirmadas</p>
                    </div>
                    <div className="bg-warning/10 rounded-xl p-4 text-center">
                        <Clock className="w-6 h-6 text-warning mx-auto mb-2" />
                        <p className="text-2xl font-bold text-warning">{todayStats.pendingReservations}</p>
                        <p className="text-sm text-muted-foreground">Pendientes</p>
                    </div>
                    <div className="bg-destructive/10 rounded-xl p-4 text-center">
                        <X className="w-6 h-6 text-destructive mx-auto mb-2" />
                        <p className="text-2xl font-bold text-destructive">{todayStats.cancelledReservations}</p>
                        <p className="text-sm text-muted-foreground">Canceladas</p>
                    </div>
                    <div className="bg-muted rounded-xl p-4 text-center">
                        <TrendingDown className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                        <p className="text-2xl font-bold">{todayStats.noShows}</p>
                        <p className="text-sm text-muted-foreground">No-shows</p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default RestaurantDashboard;
