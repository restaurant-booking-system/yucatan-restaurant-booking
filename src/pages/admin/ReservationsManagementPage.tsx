import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Search, Filter, Calendar, Clock, Users, MapPin,
    Check, X, MoreHorizontal, Phone, Mail, MessageSquare,
    ChevronDown, Download, Eye, Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/admin/AdminLayout';
import { cn } from '@/lib/utils';

// Mock reservations data
const mockReservations = [
    {
        id: 'RES-001',
        customerName: 'María García',
        customerPhone: '+52 999 123 4567',
        customerEmail: 'maria@email.com',
        date: '2024-02-15',
        time: '13:00',
        guests: 2,
        mesa: 3,
        status: 'pending',
        specialRequest: 'Mesa cerca de la ventana',
        occasion: 'Cumpleaños',
        depositPaid: false,
        createdAt: '2024-02-14T10:30:00',
    },
    {
        id: 'RES-002',
        customerName: 'Carlos López',
        customerPhone: '+52 999 234 5678',
        customerEmail: 'carlos@email.com',
        date: '2024-02-15',
        time: '14:00',
        guests: 4,
        mesa: 5,
        status: 'confirmed',
        specialRequest: '',
        occasion: '',
        depositPaid: true,
        depositAmount: 200,
        createdAt: '2024-02-13T15:00:00',
    },
    {
        id: 'RES-003',
        customerName: 'Ana Martínez',
        customerPhone: '+52 999 345 6789',
        customerEmail: 'ana@email.com',
        date: '2024-02-15',
        time: '19:00',
        guests: 6,
        mesa: 7,
        status: 'confirmed',
        specialRequest: 'Cena romántica, decoración especial',
        occasion: 'Aniversario',
        depositPaid: true,
        depositAmount: 300,
        createdAt: '2024-02-12T09:00:00',
    },
    {
        id: 'RES-004',
        customerName: 'Roberto Sánchez',
        customerPhone: '+52 999 456 7890',
        customerEmail: 'roberto@email.com',
        date: '2024-02-15',
        time: '20:00',
        guests: 8,
        mesa: 10,
        status: 'pending',
        specialRequest: 'Reunión de negocios',
        occasion: 'Negocios',
        depositPaid: false,
        createdAt: '2024-02-14T14:00:00',
    },
    {
        id: 'RES-005',
        customerName: 'Laura Torres',
        customerPhone: '+52 999 567 8901',
        customerEmail: 'laura@email.com',
        date: '2024-02-15',
        time: '21:00',
        guests: 2,
        mesa: 1,
        status: 'cancelled',
        specialRequest: '',
        occasion: '',
        depositPaid: false,
        createdAt: '2024-02-10T08:00:00',
    },
];

const ReservationsManagementPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedReservation, setSelectedReservation] = useState<typeof mockReservations[0] | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <Badge className="bg-success text-success-foreground">Confirmada</Badge>;
            case 'pending':
                return <Badge className="bg-warning text-warning-foreground">Pendiente</Badge>;
            case 'cancelled':
                return <Badge className="bg-destructive text-destructive-foreground">Cancelada</Badge>;
            case 'completed':
                return <Badge className="bg-primary text-primary-foreground">Completada</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const filteredReservations = mockReservations.filter(res => {
        const matchesSearch = res.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            res.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || res.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const pendingCount = mockReservations.filter(r => r.status === 'pending').length;
    const confirmedCount = mockReservations.filter(r => r.status === 'confirmed').length;

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold">Gestión de Reservas</h1>
                        <p className="text-muted-foreground">
                            {pendingCount} pendientes • {confirmedCount} confirmadas
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="gap-2">
                            <Download className="w-4 h-4" />
                            Exportar
                        </Button>
                        <Select defaultValue="today">
                            <SelectTrigger className="w-40">
                                <Calendar className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="Fecha" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="today">Hoy</SelectItem>
                                <SelectItem value="tomorrow">Mañana</SelectItem>
                                <SelectItem value="week">Esta semana</SelectItem>
                                <SelectItem value="month">Este mes</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre o código..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="pending">Pendientes</SelectItem>
                            <SelectItem value="confirmed">Confirmadas</SelectItem>
                            <SelectItem value="cancelled">Canceladas</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Tabs View */}
                <Tabs defaultValue="list" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="list">Lista</TabsTrigger>
                        <TabsTrigger value="timeline">Línea de tiempo</TabsTrigger>
                    </TabsList>

                    <TabsContent value="list" className="space-y-4">
                        {/* Reservations List */}
                        <div className="bg-card rounded-xl shadow-card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Código</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Cliente</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Hora</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Mesa</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Personas</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Estado</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Anticipo</th>
                                            <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {filteredReservations.map((reservation, index) => (
                                            <motion.tr
                                                key={reservation.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="hover:bg-muted/30 transition-colors"
                                            >
                                                <td className="px-4 py-4">
                                                    <span className="font-mono text-sm font-medium">{reservation.id}</span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div>
                                                        <p className="font-medium">{reservation.customerName}</p>
                                                        <p className="text-sm text-muted-foreground">{reservation.customerPhone}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                                        <span>{reservation.time}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <Badge variant="outline">Mesa {reservation.mesa}</Badge>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-4 h-4 text-muted-foreground" />
                                                        <span>{reservation.guests}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    {getStatusBadge(reservation.status)}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {reservation.depositPaid ? (
                                                        <span className="text-success font-medium">${reservation.depositAmount}</span>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {reservation.status === 'pending' && (
                                                            <>
                                                                <Button size="sm" variant="ghost" className="text-success h-8 w-8 p-0">
                                                                    <Check className="w-4 h-4" />
                                                                </Button>
                                                                <Button size="sm" variant="ghost" className="text-destructive h-8 w-8 p-0">
                                                                    <X className="w-4 h-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                                    <MoreHorizontal className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setSelectedReservation(reservation);
                                                                        setIsDetailOpen(true);
                                                                    }}
                                                                    className="gap-2"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                    Ver detalles
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="gap-2">
                                                                    <Phone className="w-4 h-4" />
                                                                    Llamar cliente
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="gap-2">
                                                                    <MessageSquare className="w-4 h-4" />
                                                                    Enviar mensaje
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem className="gap-2">
                                                                    <Edit className="w-4 h-4" />
                                                                    Editar
                                                                </DropdownMenuItem>
                                                                {reservation.status !== 'cancelled' && (
                                                                    <DropdownMenuItem className="gap-2 text-destructive">
                                                                        <X className="w-4 h-4" />
                                                                        Cancelar reserva
                                                                    </DropdownMenuItem>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {filteredReservations.length === 0 && (
                                <div className="text-center py-12">
                                    <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                                    <p className="text-muted-foreground">No se encontraron reservas</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="timeline">
                        <div className="bg-card rounded-xl p-6 shadow-card">
                            <div className="space-y-4">
                                {filteredReservations.map((reservation, index) => (
                                    <div key={reservation.id} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={cn(
                                                'w-10 h-10 rounded-full flex items-center justify-center',
                                                reservation.status === 'confirmed' ? 'bg-success/20' :
                                                    reservation.status === 'pending' ? 'bg-warning/20' : 'bg-destructive/20'
                                            )}>
                                                <Clock className={cn(
                                                    'w-5 h-5',
                                                    reservation.status === 'confirmed' ? 'text-success' :
                                                        reservation.status === 'pending' ? 'text-warning' : 'text-destructive'
                                                )} />
                                            </div>
                                            {index < filteredReservations.length - 1 && (
                                                <div className="w-0.5 h-full bg-muted my-2" />
                                            )}
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold">{reservation.time} - {reservation.customerName}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Mesa {reservation.mesa} • {reservation.guests} personas
                                                    </p>
                                                    {reservation.occasion && (
                                                        <Badge variant="outline" className="mt-2">{reservation.occasion}</Badge>
                                                    )}
                                                </div>
                                                {getStatusBadge(reservation.status)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Detail Dialog */}
                <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                    <DialogContent className="max-w-lg">
                        {selectedReservation && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        Reserva {selectedReservation.id}
                                        {getStatusBadge(selectedReservation.status)}
                                    </DialogTitle>
                                    <DialogDescription>
                                        Creada el {new Date(selectedReservation.createdAt).toLocaleDateString('es-MX')}
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Cliente</p>
                                            <p className="font-medium">{selectedReservation.customerName}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Teléfono</p>
                                            <p className="font-medium">{selectedReservation.customerPhone}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Fecha y Hora</p>
                                            <p className="font-medium">{selectedReservation.date} • {selectedReservation.time}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Mesa / Personas</p>
                                            <p className="font-medium">Mesa {selectedReservation.mesa} • {selectedReservation.guests} personas</p>
                                        </div>
                                    </div>

                                    {selectedReservation.specialRequest && (
                                        <div className="p-3 rounded-lg bg-muted">
                                            <p className="text-sm text-muted-foreground mb-1">Solicitud especial</p>
                                            <p className="text-sm">{selectedReservation.specialRequest}</p>
                                        </div>
                                    )}

                                    {selectedReservation.depositPaid && (
                                        <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                                            <p className="text-sm text-success font-medium">
                                                Anticipo pagado: ${selectedReservation.depositAmount} MXN
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <DialogFooter className="flex-col sm:flex-row gap-2">
                                    <Button variant="outline" className="gap-2">
                                        <Phone className="w-4 h-4" />
                                        Llamar
                                    </Button>
                                    <Button variant="outline" className="gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        WhatsApp
                                    </Button>
                                    {selectedReservation.status === 'pending' && (
                                        <Button className="gap-2">
                                            <Check className="w-4 h-4" />
                                            Confirmar
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

export default ReservationsManagementPage;
