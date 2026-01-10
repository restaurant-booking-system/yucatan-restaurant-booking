import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users, Clock, RefreshCw, Grid3X3, ZoomIn, ZoomOut,
    Edit, Settings, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import AdminLayout from '@/components/admin/AdminLayout';
import { cn } from '@/lib/utils';
import { mesas } from '@/data/mockData';
import { Mesa } from '@/types/restaurant';

// Extended mock data for admin view
const adminMesas: (Mesa & {
    currentReservation?: {
        customerName: string;
        time: string;
        guests: number;
        arrivedAt?: string;
    };
    nextReservation?: {
        customerName: string;
        time: string;
        guests: number;
    };
})[] = [
        { ...mesas[0], status: 'disponible' },
        { ...mesas[1], status: 'ocupada', currentReservation: { customerName: 'María García', time: '13:00', guests: 2, arrivedAt: '13:05' } },
        { ...mesas[2], status: 'ocupada', currentReservation: { customerName: 'Carlos López', time: '12:30', guests: 4, arrivedAt: '12:35' }, nextReservation: { customerName: 'Ana Torres', time: '14:30', guests: 3 } },
        { ...mesas[3], status: 'reservada', nextReservation: { customerName: 'Roberto Sánchez', time: '14:00', guests: 4 } },
        { ...mesas[4], status: 'pendiente', nextReservation: { customerName: 'Laura Martínez', time: '13:30', guests: 6 } },
        { ...mesas[5], status: 'disponible' },
        { ...mesas[6], status: 'ocupada', currentReservation: { customerName: 'Pedro Hernández', time: '12:00', guests: 8, arrivedAt: '12:10' } },
        { ...mesas[7], status: 'disponible' },
        { ...mesas[8], status: 'reservada', nextReservation: { customerName: 'Elena Castro', time: '14:30', guests: 2 } },
        { ...mesas[9], status: 'disponible' },
    ];

const TableMapOperativePage = () => {
    const [selectedMesa, setSelectedMesa] = useState<typeof adminMesas[0] | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const stats = {
        disponibles: adminMesas.filter(m => m.status === 'disponible').length,
        ocupadas: adminMesas.filter(m => m.status === 'ocupada').length,
        reservadas: adminMesas.filter(m => m.status === 'reservada').length,
        pendientes: adminMesas.filter(m => m.status === 'pendiente').length,
    };

    const totalCapacity = adminMesas.reduce((sum, m) => sum + m.capacity, 0);
    const currentGuests = adminMesas
        .filter(m => m.status === 'ocupada')
        .reduce((sum, m) => sum + (m.currentReservation?.guests || 0), 0);

    const getMesaClasses = (status: Mesa['status']) => {
        const base = 'rounded-xl transition-all duration-300 cursor-pointer flex flex-col items-center justify-center font-semibold border-2 hover:scale-105';
        switch (status) {
            case 'disponible':
                return `${base} bg-mesa-disponible border-success/50 text-white shadow-lg shadow-success/20`;
            case 'ocupada':
                return `${base} bg-mesa-ocupada border-destructive/50 text-white shadow-lg shadow-destructive/20`;
            case 'pendiente':
                return `${base} bg-mesa-pendiente border-warning/50 text-foreground shadow-lg shadow-warning/20 animate-pulse`;
            case 'reservada':
                return `${base} bg-mesa-reservada border-primary/50 text-white shadow-lg shadow-primary/20`;
            default:
                return base;
        }
    };

    const handleMesaClick = (mesa: typeof adminMesas[0]) => {
        setSelectedMesa(mesa);
        setIsDialogOpen(true);
    };

    const handleStatusChange = (newStatus: Mesa['status']) => {
        // Here would update the mesa status in the backend
        setIsDialogOpen(false);
    };

    const getTimeElapsed = (arrivedAt: string) => {
        // Simulated time calculation
        const arrival = new Date(`2024-02-15T${arrivedAt}:00`);
        const now = new Date();
        const diff = Math.floor((now.getTime() - arrival.getTime()) / (1000 * 60));
        if (diff < 60) return `${diff} min`;
        return `${Math.floor(diff / 60)}h ${diff % 60}m`;
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold">Mapa de Mesas</h1>
                        <p className="text-muted-foreground">
                            Vista operativa en tiempo real • {currentGuests} personas en el restaurante
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={autoRefresh ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className="gap-2"
                        >
                            <RefreshCw className={cn('w-4 h-4', autoRefresh && 'animate-spin')} />
                            Auto-refresh
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <a href="/admin/configuracion?tab=mesas" className="gap-2">
                                <Settings className="w-4 h-4" />
                                Configurar
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-success/10 rounded-xl p-4 text-center border border-success/20">
                        <p className="text-3xl font-bold text-success">{stats.disponibles}</p>
                        <p className="text-sm text-muted-foreground">Disponibles</p>
                    </div>
                    <div className="bg-destructive/10 rounded-xl p-4 text-center border border-destructive/20">
                        <p className="text-3xl font-bold text-destructive">{stats.ocupadas}</p>
                        <p className="text-sm text-muted-foreground">Ocupadas</p>
                    </div>
                    <div className="bg-primary/10 rounded-xl p-4 text-center border border-primary/20">
                        <p className="text-3xl font-bold text-primary">{stats.reservadas}</p>
                        <p className="text-sm text-muted-foreground">Reservadas</p>
                    </div>
                    <div className="bg-warning/10 rounded-xl p-4 text-center border border-warning/20">
                        <p className="text-3xl font-bold text-warning">{stats.pendientes}</p>
                        <p className="text-sm text-muted-foreground">Pendientes</p>
                    </div>
                </div>

                {/* Map Controls */}
                <div className="flex items-center justify-between bg-card rounded-xl p-4 shadow-card">
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">Planta:</span>
                        <Select defaultValue="main">
                            <SelectTrigger className="w-32">
                                <Grid3X3 className="w-4 h-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="main">Principal</SelectItem>
                                <SelectItem value="terrace">Terraza</SelectItem>
                                <SelectItem value="vip">VIP</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                        >
                            <ZoomOut className="w-4 h-4" />
                        </Button>
                        <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
                        >
                            <ZoomIn className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Table Map */}
                <div className="bg-card rounded-xl p-6 shadow-card overflow-auto">
                    <div
                        className="relative min-h-[500px] min-w-[700px]"
                        style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                    >
                        {/* Floor decorations */}
                        <div className="absolute top-2 left-2 right-2 h-12 bg-muted/30 rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                            🚪 Entrada
                        </div>
                        <div className="absolute bottom-2 right-2 w-24 h-24 bg-muted/30 rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                            🍽️ Cocina
                        </div>
                        <div className="absolute bottom-2 left-2 w-32 h-16 bg-muted/30 rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                            🍹 Bar
                        </div>

                        {/* Tables */}
                        {adminMesas.map((mesa) => (
                            <Tooltip key={mesa.id}>
                                <TooltipTrigger asChild>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        whileHover={{ scale: 1.1 }}
                                        onClick={() => handleMesaClick(mesa)}
                                        className={getMesaClasses(mesa.status)}
                                        style={{
                                            position: 'absolute',
                                            left: mesa.x + 40,
                                            top: mesa.y + 60,
                                            width: mesa.width,
                                            height: mesa.height,
                                            borderRadius: mesa.shape === 'round' ? '50%' : '12px',
                                        }}
                                    >
                                        <span className="text-lg">{mesa.number}</span>
                                        <span className="text-xs opacity-80">{mesa.capacity}p</span>
                                    </motion.div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs">
                                    <div className="space-y-1">
                                        <p className="font-semibold">Mesa {mesa.number}</p>
                                        <p className="text-sm">Capacidad: {mesa.capacity} personas</p>
                                        {mesa.currentReservation && (
                                            <div className="text-sm border-t pt-1 mt-1">
                                                <p className="font-medium">{mesa.currentReservation.customerName}</p>
                                                <p className="text-muted-foreground">
                                                    {mesa.currentReservation.guests} personas
                                                    {mesa.currentReservation.arrivedAt && ` • ${getTimeElapsed(mesa.currentReservation.arrivedAt)}`}
                                                </p>
                                            </div>
                                        )}
                                        {mesa.nextReservation && (
                                            <div className="text-sm border-t pt-1 mt-1">
                                                <p className="text-muted-foreground">Próxima: {mesa.nextReservation.time}</p>
                                                <p>{mesa.nextReservation.customerName}</p>
                                            </div>
                                        )}
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 justify-center">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-mesa-disponible" />
                        <span className="text-sm">Disponible</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-mesa-ocupada" />
                        <span className="text-sm">Ocupada</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-mesa-reservada" />
                        <span className="text-sm">Reservada</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-mesa-pendiente animate-pulse" />
                        <span className="text-sm">Pendiente</span>
                    </div>
                </div>

                {/* Mesa Detail Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        {selectedMesa && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        Mesa {selectedMesa.number}
                                        <Badge variant="outline">{selectedMesa.capacity} personas</Badge>
                                    </DialogTitle>
                                    <DialogDescription>
                                        Estado actual: {selectedMesa.status}
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4">
                                    {selectedMesa.currentReservation && (
                                        <div className="p-4 rounded-lg bg-muted">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Users className="w-4 h-4" />
                                                <span className="font-medium">Ocupación actual</span>
                                            </div>
                                            <p className="font-semibold">{selectedMesa.currentReservation.customerName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedMesa.currentReservation.guests} personas • Llegó a las {selectedMesa.currentReservation.arrivedAt}
                                            </p>
                                            {selectedMesa.currentReservation.arrivedAt && (
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    <Clock className="w-3 h-3 inline mr-1" />
                                                    Tiempo: {getTimeElapsed(selectedMesa.currentReservation.arrivedAt)}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {selectedMesa.nextReservation && (
                                        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Clock className="w-4 h-4" />
                                                <span className="font-medium">Próxima reserva</span>
                                            </div>
                                            <p className="font-semibold">{selectedMesa.nextReservation.customerName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedMesa.nextReservation.time} • {selectedMesa.nextReservation.guests} personas
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <p className="text-sm font-medium mb-2">Cambiar estado:</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button
                                                variant="outline"
                                                className="gap-2 justify-start"
                                                onClick={() => handleStatusChange('disponible')}
                                            >
                                                <div className="w-3 h-3 rounded bg-mesa-disponible" />
                                                Disponible
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="gap-2 justify-start"
                                                onClick={() => handleStatusChange('ocupada')}
                                            >
                                                <div className="w-3 h-3 rounded bg-mesa-ocupada" />
                                                Ocupada
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="gap-2 justify-start"
                                                onClick={() => handleStatusChange('reservada')}
                                            >
                                                <div className="w-3 h-3 rounded bg-mesa-reservada" />
                                                Reservada
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="gap-2 justify-start"
                                                onClick={() => handleStatusChange('pendiente')}
                                            >
                                                <div className="w-3 h-3 rounded bg-mesa-pendiente" />
                                                Pendiente
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button variant="outline" className="gap-2">
                                        <Edit className="w-4 h-4" />
                                        Editar mesa
                                    </Button>
                                    {selectedMesa.status === 'ocupada' && (
                                        <Button className="gap-2">
                                            <Check className="w-4 h-4" />
                                            Liberar mesa
                                        </Button>
                                    )}
                                </DialogFooter>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
};

export default TableMapOperativePage;
