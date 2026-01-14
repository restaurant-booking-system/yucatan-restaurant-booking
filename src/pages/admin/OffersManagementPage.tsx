import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, Plus, Calendar, Percent, Edit, Trash2, Eye, EyeOff, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/components/admin/AdminLayout';
import { useRestaurantOffers, useUpdateOffer, useDeleteOffer } from '@/hooks/useData';
import { useRestaurantAuth } from '@/contexts/RestaurantAuthContext';
import { Offer } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const OffersManagementPage = () => {
    const { restaurant } = useRestaurantAuth();
    const restaurantId = restaurant?.id;

    const { data: offers = [], isLoading, error } = useRestaurantOffers(restaurantId);
    const updateOfferMutation = useUpdateOffer();
    const deleteOfferMutation = useDeleteOffer();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

    const toggleActive = async (id: string, currentStatus: boolean) => {
        try {
            await updateOfferMutation.mutateAsync({
                offerId: id,
                updates: { isActive: !currentStatus }
            });
        } catch (err) {
            console.error('Error toggling status:', err);
        }
    };

    const handleDeleteOffer = async (id: string) => {
        if (confirm('¿Estás seguro de que deseas eliminar esta oferta?')) {
            try {
                await deleteOfferMutation.mutateAsync(id);
            } catch (err) {
                console.error('Error deleting offer:', err);
            }
        }
    };

    const activeCount = offers.filter(o => o.isActive).length;

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="ml-2">Cargando ofertas...</span>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold">Gestión de Ofertas</h1>
                        <p className="text-muted-foreground">{activeCount} ofertas activas</p>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                        <Plus className="w-4 h-4" />Nueva oferta
                    </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-primary/10 rounded-xl p-4 text-center border border-primary/20">
                        <Tag className="w-6 h-6 text-primary mx-auto mb-2" />
                        <p className="text-2xl font-bold">{offers.length}</p>
                        <p className="text-xs text-muted-foreground">Total ofertas</p>
                    </div>
                    <div className="bg-success/10 rounded-xl p-4 text-center border border-success/20">
                        <Eye className="w-6 h-6 text-success mx-auto mb-2" />
                        <p className="text-2xl font-bold">{activeCount}</p>
                        <p className="text-xs text-muted-foreground">Activas</p>
                    </div>
                    <div className="bg-secondary/10 rounded-xl p-4 text-center border border-secondary/20">
                        <Percent className="w-6 h-6 text-secondary mx-auto mb-2" />
                        <p className="text-2xl font-bold">{offers.reduce((sum, o) => sum + (o.usageCount || 0), 0)}</p>
                        <p className="text-xs text-muted-foreground">Usos totales</p>
                    </div>
                </div>

                {offers.length === 0 ? (
                    <div className="text-center py-16 bg-card rounded-xl border-2 border-dashed">
                        <Tag className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                        <h3 className="text-lg font-semibold">No tienes ofertas creadas</h3>
                        <p className="text-muted-foreground mb-6">Crea promociones para atraer más clientes a tu restaurante.</p>
                        <Button onClick={() => setIsCreateOpen(true)}>Crear mi primera oferta</Button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {offers.map((offer, index) => (
                            <motion.div
                                key={offer.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`bg-card rounded-xl p-6 shadow-card border-2 ${offer.isActive ? 'border-success/30' : 'border-transparent opacity-70'}`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <Badge className={offer.isActive ? 'bg-success' : 'bg-muted'}>{offer.isActive ? 'Activa' : 'Inactiva'}</Badge>
                                    <Switch
                                        checked={offer.isActive}
                                        onCheckedChange={() => toggleActive(offer.id, offer.isActive)}
                                    />
                                </div>
                                <h3 className="text-xl font-display font-bold mb-2">{offer.title}</h3>
                                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{offer.description}</p>
                                <div className="bg-secondary/10 rounded-lg p-3 text-center mb-4">
                                    <p className="text-2xl font-bold text-secondary">{offer.discount}</p>
                                </div>
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="w-3 h-3" />
                                        <span>
                                            {offer.validFrom ? format(new Date(offer.validFrom), 'PP', { locale: es }) : 'Cualquier fecha'} - {offer.validUntil ? format(new Date(offer.validUntil), 'PP', { locale: es }) : 'Sin límite'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Clock className="w-3 h-3" />
                                        <span>{offer.usageCount || 0} usos reales</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditingOffer(offer)}>
                                        <Edit className="w-4 h-4 mr-1" />Editar
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteOffer(offer.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                <Dialog open={isCreateOpen || !!editingOffer} onOpenChange={(open) => { if (!open) { setIsCreateOpen(false); setEditingOffer(null); } }}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>{editingOffer ? 'Editar oferta' : 'Nueva oferta'}</DialogTitle></DialogHeader>
                        <div className="space-y-4">
                            <div><Label>Título</Label><Input placeholder="2x1 en bebidas" defaultValue={editingOffer?.title} /></div>
                            <div><Label>Descripción</Label><Textarea placeholder="Descripción de la oferta" defaultValue={editingOffer?.description} /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label>Tipo</Label><Select defaultValue={editingOffer?.discountType || 'percentage'}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="percentage">Porcentaje</SelectItem><SelectItem value="fixed">Monto fijo</SelectItem><SelectItem value="bogo">2x1</SelectItem></SelectContent></Select></div>
                                <div><Label>Descuento (Texto)</Label><Input placeholder="20% o 2x1" defaultValue={editingOffer?.discount} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label>Fecha inicio</Label><Input type="date" defaultValue={editingOffer?.validFrom} /></div>
                                <div><Label>Fecha fin</Label><Input type="date" defaultValue={editingOffer?.validUntil} /></div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => { setIsCreateOpen(false); setEditingOffer(null); }}>Cancelar</Button>
                            <Button>{editingOffer ? 'Guardar cambios' : 'Crear oferta'}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
};

export default OffersManagementPage;
