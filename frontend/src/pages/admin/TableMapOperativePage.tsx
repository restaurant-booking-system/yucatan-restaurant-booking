import { useState } from 'react';
import {
    Users, Clock, RefreshCw, Grid3X3, ZoomIn, ZoomOut,
    Edit, Settings, Check, Layout, Trash2, Move, MousePointer2, Plus, ArrowRight
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useTables, useUpdateTableStatus, useCreateTable, useUpdateTable, useDeleteTable } from '@/hooks/useData';
import { useRestaurantAuth } from '@/contexts/RestaurantAuthContext';
import { Table, TableStatus } from '@/types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Extended table type for admin view
type AdminTable = Table & {
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
};

const TableMapOperativePage = () => {
    // Get restaurant ID from auth context
    const { restaurant } = useRestaurantAuth();
    const restaurantId = restaurant?.id;
    const { data: tablesData = [], isLoading, refetch } = useTables(restaurantId);

    const updateTableStatusMutation = useUpdateTableStatus();
    const createTableMutation = useCreateTable();
    const updateTableMutation = useUpdateTable();
    const deleteTableMutation = useDeleteTable();

    // Cast tables to admin type
    const adminMesas: AdminTable[] = tablesData.map(table => ({
        ...table,
    }));

    const [selectedMesa, setSelectedMesa] = useState<AdminTable | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);

    // Local state for form editing (to avoid re-render loops)
    const [editNumber, setEditNumber] = useState('');
    const [editCapacity, setEditCapacity] = useState(4);
    const [editShape, setEditShape] = useState<'round' | 'square'>('round');

    // Map area constraints for drag
    const mapWidth = 700;
    const mapHeight = 500;
    const tableSize = 60;

    const stats = {
        disponibles: adminMesas.filter(m => m.status === 'disponible').length,
        ocupadas: adminMesas.filter(m => m.status === 'ocupada').length,
        reservadas: adminMesas.filter(m => m.status === 'reservada').length,
        pendientes: adminMesas.filter(m => m.status === 'pendiente').length,
    };

    const totalCapacity = adminMesas.reduce((sum, m) => sum + m.capacity, 0);
    const currentGuests = adminMesas
        .filter(m => m.status === 'ocupada')
        .reduce((sum, m) => sum + (m.capacity || 0), 0);

    const getMesaClasses = (status: TableStatus) => {
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
        // Populate local edit state
        setEditNumber(mesa.number);
        setEditCapacity(mesa.capacity);
        setEditShape(mesa.shape as 'round' | 'square');
        setIsDialogOpen(true);
    };

    const handleStatusChange = async (newStatus: TableStatus) => {
        if (!selectedMesa) return;

        try {
            await updateTableStatusMutation.mutateAsync({
                tableId: selectedMesa.id,
                status: newStatus
            });
            toast.success(`Mesa ${selectedMesa.number} actualizada a ${newStatus}`);
            refetch();
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Error updating table status:', error);
            toast.error('Error al actualizar el estado de la mesa');
        }
    };

    const handleDragEnd = async (mesa: AdminTable, info: any) => {
        if (!isEditMode) return;

        const newX = Math.round(mesa.x + info.offset.x / zoom);
        const newY = Math.round(mesa.y + info.offset.y / zoom);

        try {
            await updateTableMutation.mutateAsync({
                tableId: mesa.id,
                updates: { x: newX, y: newY }
            });
            refetch();
        } catch (err) {
            console.error('Error moving table:', err);
        }
    };

    const handleAddTable = async () => {
        if (!restaurantId) return;

        const nextNumber = adminMesas.length > 0
            ? Math.max(...adminMesas.map(m => parseInt(m.number) || 0)) + 1
            : 1;

        try {
            await createTableMutation.mutateAsync({
                restaurantId,
                number: nextNumber.toString(),
                capacity: 4,
                shape: 'round',
                x: 100,
                y: 100
            });
            toast.success('Mesa agregada');
            refetch();
        } catch (err) {
            toast.error('Error al agregar mesa');
        }
    };

    // Save table edits when clicking 'Listo'
    const handleSaveTableEdits = async () => {
        if (!selectedMesa) {
            setIsDialogOpen(false);
            return;
        }

        // Only save if there are changes
        const hasChanges =
            editNumber !== selectedMesa.number ||
            editCapacity !== selectedMesa.capacity ||
            editShape !== selectedMesa.shape;

        if (hasChanges) {
            try {
                await updateTableMutation.mutateAsync({
                    tableId: selectedMesa.id,
                    updates: {
                        number: editNumber,
                        capacity: editCapacity,
                        shape: editShape
                    }
                });
                toast.success('Mesa actualizada');
                refetch();
            } catch (err) {
                toast.error('Error al guardar cambios');
            }
        }

        setIsDialogOpen(false);
    };

    const handleDeleteTable = async () => {
        if (!selectedMesa) return;

        try {
            await deleteTableMutation.mutateAsync(selectedMesa.id);
            toast.success('Mesa eliminada');
            refetch();
            setIsDialogOpen(false);
            setSelectedMesa(null);
        } catch (err) {
            toast.error('Error al eliminar mesa');
        }
    };

    const handleSeedTables = async () => {
        if (!restaurantId || adminMesas.length > 0) return;

        const initialTables = [
            { number: '1', capacity: 2, shape: 'round', x: 100, y: 150 },
            { number: '2', capacity: 2, shape: 'round', x: 250, y: 150 },
            { number: '3', capacity: 4, shape: 'square', x: 400, y: 150 },
            { number: '4', capacity: 4, shape: 'square', x: 550, y: 150 },
        ];

        try {
            for (const table of initialTables) {
                await createTableMutation.mutateAsync({
                    ...table,
                    restaurantId
                });
            }
            toast.success('Diseño inicial generado');
            refetch();
        } catch (err) {
            toast.error('Error al generar diseño');
        }
    };

    const handleDragStart = () => {
        if (!isEditMode) return;
    };

    const getTimeElapsed = (arrivedAt: string | undefined) => {
        if (!arrivedAt) return '';
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
                            variant={isEditMode ? "default" : "outline"}
                            size="sm"
                            onClick={() => setIsEditMode(!isEditMode)}
                            className="gap-2"
                        >
                            {isEditMode ? <Layout className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                            {isEditMode ? 'Finalizar Diseño' : 'Configurar Mapa'}
                        </Button>
                        {!isEditMode && (
                            <Button
                                variant={autoRefresh ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setAutoRefresh(!autoRefresh)}
                                className="gap-2"
                            >
                                <RefreshCw className={cn('w-4 h-4', autoRefresh && 'animate-spin')} />
                                Auto-refresh
                            </Button>
                        )}
                        {isEditMode && (
                            <Button size="sm" className="gap-2" onClick={handleAddTable} disabled={createTableMutation.isPending}>
                                {createTableMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                Agregar Mesa
                            </Button>
                        )}
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

                        {isEditMode && (
                            <div className="hidden md:flex items-center gap-2 border-l pl-4 ml-4">
                                <MousePointer2 className="w-4 h-4 text-primary" />
                                <span className="text-xs font-medium text-primary uppercase tracking-wider">Modo Edición</span>
                            </div>
                        )}
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
                    <motion.div
                        className="relative"
                        style={{
                            transform: `scale(${zoom})`,
                            transformOrigin: 'top left',
                            width: `${mapWidth}px`,
                            height: `${mapHeight}px`,
                            // Grid background pattern
                            backgroundImage: isEditMode
                                ? 'linear-gradient(to right, hsl(var(--muted)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--muted)) 1px, transparent 1px)'
                                : 'none',
                            backgroundSize: '40px 40px',
                        }}
                    >
                        {/* Grid area indicator when in edit mode */}
                        {isEditMode && (
                            <div
                                className="absolute inset-0 border-2 border-dashed border-primary/30 rounded-xl pointer-events-none"
                                style={{ zIndex: 1 }}
                            >
                                <span className="absolute -top-6 left-2 text-xs text-muted-foreground">
                                    Área del restaurante ({mapWidth}x{mapHeight}px)
                                </span>
                            </div>
                        )}

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
                        {adminMesas.length === 0 && !isLoading && isEditMode && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl bg-muted/20">
                                <Layout className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                                <p className="text-muted-foreground font-medium">El mapa está vacío</p>
                                <Button variant="outline" className="mt-4" onClick={handleSeedTables}>
                                    Generar diseño base
                                </Button>
                            </div>
                        )}

                        {adminMesas.map((mesa) => (
                            <Tooltip key={mesa.id}>
                                <TooltipTrigger asChild>
                                    <motion.div
                                        drag={isEditMode}
                                        dragMomentum={false}
                                        dragConstraints={{
                                            left: -((mesa.x || 0) + 40),
                                            right: mapWidth - (mesa.x || 0) - (mesa.width || tableSize) - 40,
                                            top: -((mesa.y || 0) + 60),
                                            bottom: mapHeight - (mesa.y || 0) - (mesa.height || tableSize) - 60
                                        }}
                                        onDragStart={handleDragStart}
                                        onDragEnd={(_, info) => handleDragEnd(mesa, info)}
                                        initial={{ scale: 0 }}
                                        animate={{
                                            scale: 1,
                                            boxShadow: isEditMode ? '0 0 0 2px hsl(var(--primary))' : 'none'
                                        }}
                                        whileHover={{ scale: isEditMode ? 1.05 : 1.1 }}
                                        onClick={() => handleMesaClick(mesa)}
                                        className={`${getMesaClasses(mesa.status)} ${isEditMode ? 'cursor-move' : ''}`}
                                        style={{
                                            position: 'absolute',
                                            left: (mesa.x || 0) + 40,
                                            top: (mesa.y || 0) + 60,
                                            width: mesa.width || 60,
                                            height: mesa.height || 60,
                                            borderRadius: mesa.shape === 'round' ? '50%' : '12px',
                                            zIndex: 10
                                        }}
                                    >
                                        {isEditMode && (
                                            <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                                                <Move className="w-2 h-2" />
                                            </div>
                                        )}
                                        <span className="text-lg font-bold">{mesa.number}</span>
                                        <span className="text-xs opacity-80">{mesa.capacity}p</span>
                                    </motion.div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs">
                                    <div className="space-y-1">
                                        <p className="font-semibold">Mesa {mesa.number}</p>
                                        <p className="text-sm">Capacidad: {mesa.capacity} personas</p>
                                        {isEditMode && <p className="text-[10px] text-primary italic">Click para editar • Arrastra para mover</p>}
                                        {!isEditMode && mesa.currentReservation && (
                                            <div className="text-sm border-t pt-1 mt-1">
                                                <p className="font-medium">{mesa.currentReservation.customerName}</p>
                                                <p className="text-muted-foreground">
                                                    {mesa.currentReservation.guests} personas
                                                    {mesa.currentReservation.arrivedAt && ` • ${getTimeElapsed(mesa.currentReservation.arrivedAt)}`}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </motion.div>
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
                                    {isEditMode ? (
                                        <div className="space-y-4 py-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Número de Mesa</Label>
                                                    <Input
                                                        value={editNumber}
                                                        onChange={(e) => setEditNumber(e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Capacidad</Label>
                                                    <Input
                                                        type="number"
                                                        value={editCapacity}
                                                        onChange={(e) => setEditCapacity(parseInt(e.target.value) || 1)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Forma</Label>
                                                <Select
                                                    value={editShape}
                                                    onValueChange={(v) => setEditShape(v as 'round' | 'square')}
                                                >
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="round">Redonda</SelectItem>
                                                        <SelectItem value="square">Cuadrada</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
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
                                                        disabled={updateTableStatusMutation.isPending}
                                                    >
                                                        {updateTableStatusMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <div className="w-3 h-3 rounded bg-mesa-disponible" />}
                                                        Disponible
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="gap-2 justify-start"
                                                        onClick={() => handleStatusChange('ocupada')}
                                                        disabled={updateTableStatusMutation.isPending}
                                                    >
                                                        {updateTableStatusMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <div className="w-3 h-3 rounded bg-mesa-ocupada" />}
                                                        Ocupada
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="gap-2 justify-start"
                                                        onClick={() => handleStatusChange('reservada')}
                                                        disabled={updateTableStatusMutation.isPending}
                                                    >
                                                        {updateTableStatusMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <div className="w-3 h-3 rounded bg-mesa-reservada" />}
                                                        Reservada
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="gap-2 justify-start"
                                                        onClick={() => handleStatusChange('pendiente')}
                                                        disabled={updateTableStatusMutation.isPending}
                                                    >
                                                        {updateTableStatusMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <div className="w-3 h-3 rounded bg-mesa-pendiente" />}
                                                        Pendiente
                                                    </Button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <DialogFooter>
                                    {isEditMode ? (
                                        <div className="flex justify-between w-full">
                                            <Button variant="destructive" className="gap-2" onClick={handleDeleteTable} disabled={deleteTableMutation.isPending}>
                                                {deleteTableMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                Eliminar Mesa
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={handleSaveTableEdits}
                                                disabled={updateTableMutation.isPending}
                                            >
                                                {updateTableMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                                Guardar
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <Button variant="outline" className="gap-2" onClick={() => setIsEditMode(true)}>
                                                <Edit className="w-4 h-4" />
                                                Modo Edición
                                            </Button>
                                            {selectedMesa.status === 'ocupada' && (
                                                <Button className="gap-2" onClick={() => handleStatusChange('disponible')}>
                                                    <Check className="w-4 h-4" />
                                                    Liberar mesa
                                                </Button>
                                            )}
                                        </>
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
