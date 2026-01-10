import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, Users, Calendar, DollarSign, Clock, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import AdminLayout from '@/components/admin/AdminLayout';

const ReportsPage = () => {
    const stats = {
        totalReservations: 486,
        completedReservations: 425,
        noShows: 28,
        cancellations: 33,
        avgOccupancy: 78,
        peakDay: 'Sábado',
        peakHour: '20:00',
        avgPartySize: 3.2,
        totalRevenue: 245600,
        avgTicket: 578,
    };

    const weeklyData = [
        { day: 'Lun', reservations: 42, occupancy: 65 },
        { day: 'Mar', reservations: 38, occupancy: 58 },
        { day: 'Mié', reservations: 45, occupancy: 70 },
        { day: 'Jue', reservations: 52, occupancy: 75 },
        { day: 'Vie', reservations: 78, occupancy: 92 },
        { day: 'Sáb', reservations: 95, occupancy: 98 },
        { day: 'Dom', reservations: 68, occupancy: 82 },
    ];

    const offerPerformance = [
        { name: '20% Cena Romántica', uses: 45, revenue: 32500 },
        { name: '2x1 Cocktails', uses: 120, revenue: 18000 },
        { name: 'Menú Degustación', uses: 28, revenue: 42000 },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div><h1 className="text-3xl font-display font-bold">Reportes</h1><p className="text-muted-foreground">Análisis operativo del restaurante</p></div>
                    <div className="flex gap-2">
                        <Select defaultValue="month"><SelectTrigger className="w-40"><Calendar className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="week">Esta semana</SelectItem><SelectItem value="month">Este mes</SelectItem><SelectItem value="quarter">Este trimestre</SelectItem></SelectContent></Select>
                        <Button variant="outline">Exportar</Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl p-6 shadow-card">
                        <div className="flex justify-between items-start mb-4"><Calendar className="w-8 h-8 text-primary" /><span className="text-sm text-success flex items-center gap-1"><TrendingUp className="w-3 h-3" />+12%</span></div>
                        <p className="text-3xl font-bold">{stats.totalReservations}</p><p className="text-sm text-muted-foreground">Reservas totales</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl p-6 shadow-card">
                        <div className="flex justify-between items-start mb-4"><Users className="w-8 h-8 text-success" /></div>
                        <p className="text-3xl font-bold">{stats.avgOccupancy}%</p><p className="text-sm text-muted-foreground">Ocupación promedio</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl p-6 shadow-card">
                        <div className="flex justify-between items-start mb-4"><DollarSign className="w-8 h-8 text-secondary" /><span className="text-sm text-success flex items-center gap-1"><TrendingUp className="w-3 h-3" />+8%</span></div>
                        <p className="text-3xl font-bold">${(stats.totalRevenue / 1000).toFixed(0)}k</p><p className="text-sm text-muted-foreground">Ingresos estimados</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-xl p-6 shadow-card">
                        <div className="flex justify-between items-start mb-4"><Clock className="w-8 h-8 text-warning" /><span className="text-sm text-destructive flex items-center gap-1"><TrendingDown className="w-3 h-3" />-5%</span></div>
                        <p className="text-3xl font-bold">{stats.noShows}</p><p className="text-sm text-muted-foreground">No-shows</p>
                    </motion.div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    <div className="bg-card rounded-xl p-6 shadow-card">
                        <h3 className="text-xl font-display font-semibold mb-6">Reservas por día</h3>
                        <div className="space-y-4">
                            {weeklyData.map(d => (
                                <div key={d.day} className="flex items-center gap-4">
                                    <span className="w-12 font-medium">{d.day}</span>
                                    <div className="flex-1"><Progress value={d.occupancy} className="h-4" /></div>
                                    <span className="w-20 text-right">{d.reservations} res.</span>
                                    <span className="w-12 text-right text-muted-foreground">{d.occupancy}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-card rounded-xl p-6 shadow-card">
                        <h3 className="text-xl font-display font-semibold mb-6">Rendimiento de ofertas</h3>
                        <div className="space-y-4">
                            {offerPerformance.map((offer, i) => (
                                <div key={i} className="p-4 rounded-lg bg-muted/50">
                                    <div className="flex justify-between mb-2"><span className="font-medium">{offer.name}</span><span className="text-success font-bold">${(offer.revenue / 1000).toFixed(1)}k</span></div>
                                    <div className="flex justify-between text-sm text-muted-foreground"><span>{offer.uses} usos</span><span>${Math.round(offer.revenue / offer.uses)}/uso promedio</span></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-muted/50 rounded-xl p-4 text-center"><p className="text-muted-foreground text-sm mb-1">Día más ocupado</p><p className="text-xl font-bold">{stats.peakDay}</p></div>
                    <div className="bg-muted/50 rounded-xl p-4 text-center"><p className="text-muted-foreground text-sm mb-1">Hora pico</p><p className="text-xl font-bold">{stats.peakHour}</p></div>
                    <div className="bg-muted/50 rounded-xl p-4 text-center"><p className="text-muted-foreground text-sm mb-1">Tamaño promedio</p><p className="text-xl font-bold">{stats.avgPartySize} personas</p></div>
                    <div className="bg-muted/50 rounded-xl p-4 text-center"><p className="text-muted-foreground text-sm mb-1">Ticket promedio</p><p className="text-xl font-bold">${stats.avgTicket}</p></div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ReportsPage;
