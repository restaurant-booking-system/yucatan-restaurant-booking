import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, Phone, Plus, UserPlus, Bell, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/components/admin/AdminLayout';
import { useWaitlist, useAddToWaitlist, useUpdateWaitlistStatus, useRemoveFromWaitlist } from '@/hooks/useData';
import { useRestaurantAuth } from '@/contexts/RestaurantAuthContext';
import { WaitlistEntry } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const WaitlistPage = () => {
    const { restaurant } = useRestaurantAuth();
    const restaurantId = restaurant?.id;

    const { data: waitlist = [], isLoading } = useWaitlist(restaurantId);
    const addToWaitlistMutation = useAddToWaitlist();
    const updateStatusMutation = useUpdateWaitlistStatus();
    const removeMutation = useRemoveFromWaitlist();

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', guests: '2' });

    const handleAddCustomer = async () => {
        if (!restaurantId) return;
        try {
            await addToWaitlistMutation.mutateAsync({
                restaurantId,
                name: newCustomer.name,
                phone: newCustomer.phone,
                partySize: parseInt(newCustomer.guests),
                status: 'waiting',
                estimatedWait: 15, // Default or calculated
                priority: 'normal'
            });
            setNewCustomer({ name: '', phone: '', guests: '2' });
            setIsAddOpen(false);
        } catch (err) {
            console.error('Error adding to waitlist:', err);
        }
    };

    const handleUpdateStatus = async (id: string, status: WaitlistEntry['status']) => {
        try {
            await updateStatusMutation.mutateAsync({ entryId: id, status });
        } catch (err) {
            console.error('Error updating waitlist status:', err);
        }
    };

    const handleRemove = async (id: string) => {
        if (confirm('¿Estás seguro de que deseas eliminar a este cliente de la lista?')) {
            try {
                await removeMutation.mutateAsync(id);
            } catch (err) {
                console.error('Error removing from waitlist:', err);
            }
        }
    };

    const waitingCount = waitlist.filter(w => w.status === 'waiting' || w.status === 'notified').length;

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="ml-2">Cargando lista de espera...</span>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold">Lista de Espera</h1>
                        <p className="text-muted-foreground">{waitingCount} clientes esperando</p>
                    </div>
                    <Button onClick={() => setIsAddOpen(true)} className="gap-2">
                        <UserPlus className="w-4 h-4" />Agregar cliente
                    </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-primary/10 rounded-xl p-4 text-center border border-primary/20">
                        <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                        <p className="text-2xl font-bold">{waitingCount}</p>
                        <p className="text-xs text-muted-foreground">En espera</p>
                    </div>
                    <div className="bg-warning/10 rounded-xl p-4 text-center border border-warning/20">
                        <Clock className="w-6 h-6 text-warning mx-auto mb-2" />
                        <p className="text-2xl font-bold">
                            {waitlist.length > 0 ? Math.round(waitlist.reduce((acc, curr) => acc + curr.estimatedWait, 0) / waitlist.length) : 0}
                        </p>
                        <p className="text-xs text-muted-foreground">Min. espera prom.</p>
                    </div>
                    <div className="bg-success/10 rounded-xl p-4 text-center border border-success/20">
                        <Check className="w-6 h-6 text-success mx-auto mb-2" />
                        <p className="text-2xl font-bold">{waitlist.reduce((sum, w) => sum + (w.status === 'seated' ? w.partySize : 0), 0)}</p>
                        <p className="text-xs text-muted-foreground">Atendidos hoy</p>
                    </div>
                </div>

                <div className="bg-card rounded-xl shadow-card overflow-hidden border">
                    <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                        <h2 className="font-semibold">Cola de espera</h2>
                        <Badge variant="outline" className="bg-background">Actualizado en tiempo real</Badge>
                    </div>
                    {waitlist.filter(w => w.status === 'waiting' || w.status === 'notified').length === 0 ? (
                        <div className="p-16 text-center">
                            <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-muted-foreground">No hay clientes en espera en este momento.</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {waitlist
                                .filter(w => w.status === 'waiting' || w.status === 'notified')
                                .map((customer, index) => (
                                    <motion.div
                                        key={customer.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold">{customer.name}</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-2">
                                                <Phone className="w-3 h-3" />{customer.phone}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <Badge variant="outline" className="bg-background">{customer.partySize} personas</Badge>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-bold">
                                                {formatDistanceToNow(new Date(customer.createdAt), { locale: es, addSuffix: false }).replace('hace ', '')}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-tight">Espera</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={cn("h-8 w-8 p-0", customer.status === 'notified' && "text-primary border-primary bg-primary/5")}
                                                onClick={() => handleUpdateStatus(customer.id, 'notified')}
                                            >
                                                <Bell className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="h-8 gap-2"
                                                onClick={() => handleUpdateStatus(customer.id, 'seated')}
                                            >
                                                <Check className="w-4 h-4" />
                                                Asignar
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-destructive"
                                                onClick={() => handleRemove(customer.id)}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                        </div>
                    )}
                </div>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Agregar a lista de espera</DialogTitle></DialogHeader>
                        <div className="space-y-4">
                            <div><Label>Nombre</Label><Input value={newCustomer.name} onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} placeholder="Nombre del cliente" /></div>
                            <div><Label>Teléfono</Label><Input value={newCustomer.phone} onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} placeholder="+52 999 123 4567" /></div>
                            <div><Label>Personas</Label><Select value={newCustomer.guests} onValueChange={(v) => setNewCustomer({ ...newCustomer, guests: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{[1, 2, 3, 4, 5, 6, 7, 8].map(n => <SelectItem key={n} value={n.toString()}>{n} {n === 1 ? 'persona' : 'personas'}</SelectItem>)}</SelectContent></Select></div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
                            <Button
                                onClick={handleAddCustomer}
                                disabled={!newCustomer.name || !newCustomer.phone || addToWaitlistMutation.isPending}
                            >
                                {addToWaitlistMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                                Agregar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
};

export default WaitlistPage;
