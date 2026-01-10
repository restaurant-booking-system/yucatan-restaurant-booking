import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, Plus, Calendar, Percent, Edit, Trash2, Eye, EyeOff, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/components/admin/AdminLayout';

const mockOffers = [
    { id: 1, title: '20% Cena Romántica', description: 'Válido para parejas', discount: '20%', type: 'percentage', startDate: '2024-02-01', endDate: '2024-02-14', isActive: true, usageCount: 45 },
    { id: 2, title: '2x1 Cocktails', description: 'Toda la carta de cocktails', discount: '2x1', type: 'bogo', startDate: '2024-02-01', endDate: '2024-02-28', isActive: true, usageCount: 120 },
    { id: 3, title: 'Menú Degustación Especial', description: '7 tiempos con maridaje', discount: '$1,500', type: 'fixed', startDate: '2024-01-15', endDate: '2024-03-15', isActive: false, usageCount: 28 },
];

const OffersManagementPage = () => {
    const [offers, setOffers] = useState(mockOffers);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingOffer, setEditingOffer] = useState<typeof mockOffers[0] | null>(null);

    const toggleActive = (id: number) => {
        setOffers(offers.map(o => o.id === id ? { ...o, isActive: !o.isActive } : o));
    };

    const deleteOffer = (id: number) => {
        setOffers(offers.filter(o => o.id !== id));
    };

    const activeCount = offers.filter(o => o.isActive).length;

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div><h1 className="text-3xl font-display font-bold">Gestión de Ofertas</h1><p className="text-muted-foreground">{activeCount} ofertas activas</p></div>
                    <Button onClick={() => setIsCreateOpen(true)} className="gap-2"><Plus className="w-4 h-4" />Nueva oferta</Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-primary/10 rounded-xl p-4 text-center border border-primary/20"><Tag className="w-6 h-6 text-primary mx-auto mb-2" /><p className="text-2xl font-bold">{offers.length}</p><p className="text-sm">Total ofertas</p></div>
                    <div className="bg-success/10 rounded-xl p-4 text-center border border-success/20"><Eye className="w-6 h-6 text-success mx-auto mb-2" /><p className="text-2xl font-bold">{activeCount}</p><p className="text-sm">Activas</p></div>
                    <div className="bg-secondary/10 rounded-xl p-4 text-center border border-secondary/20"><Percent className="w-6 h-6 text-secondary mx-auto mb-2" /><p className="text-2xl font-bold">{offers.reduce((sum, o) => sum + o.usageCount, 0)}</p><p className="text-sm">Usos totales</p></div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {offers.map(offer => (
                        <motion.div key={offer.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className={`bg-card rounded-xl p-6 shadow-card border-2 ${offer.isActive ? 'border-success/30' : 'border-transparent opacity-70'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <Badge className={offer.isActive ? 'bg-success' : 'bg-muted'}>{offer.isActive ? 'Activa' : 'Inactiva'}</Badge>
                                <Switch checked={offer.isActive} onCheckedChange={() => toggleActive(offer.id)} />
                            </div>
                            <h3 className="text-xl font-display font-bold mb-2">{offer.title}</h3>
                            <p className="text-muted-foreground text-sm mb-4">{offer.description}</p>
                            <div className="bg-secondary/10 rounded-lg p-3 text-center mb-4">
                                <p className="text-2xl font-bold text-secondary">{offer.discount}</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                <Calendar className="w-4 h-4" />
                                <span>{offer.startDate} - {offer.endDate}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                <Clock className="w-4 h-4" />
                                <span>{offer.usageCount} usos</span>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditingOffer(offer)}><Edit className="w-4 h-4 mr-1" />Editar</Button>
                                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteOffer(offer.id)}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <Dialog open={isCreateOpen || !!editingOffer} onOpenChange={(open) => { if (!open) { setIsCreateOpen(false); setEditingOffer(null); } }}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>{editingOffer ? 'Editar oferta' : 'Nueva oferta'}</DialogTitle></DialogHeader>
                        <div className="space-y-4">
                            <div><Label>Título</Label><Input placeholder="2x1 en bebidas" defaultValue={editingOffer?.title} /></div>
                            <div><Label>Descripción</Label><Textarea placeholder="Descripción de la oferta" defaultValue={editingOffer?.description} /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label>Tipo</Label><Select defaultValue={editingOffer?.type || 'percentage'}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="percentage">Porcentaje</SelectItem><SelectItem value="fixed">Monto fijo</SelectItem><SelectItem value="bogo">2x1</SelectItem></SelectContent></Select></div>
                                <div><Label>Descuento</Label><Input placeholder="20%" defaultValue={editingOffer?.discount} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label>Fecha inicio</Label><Input type="date" defaultValue={editingOffer?.startDate} /></div>
                                <div><Label>Fecha fin</Label><Input type="date" defaultValue={editingOffer?.endDate} /></div>
                            </div>
                        </div>
                        <DialogFooter><Button variant="outline" onClick={() => { setIsCreateOpen(false); setEditingOffer(null); }}>Cancelar</Button><Button>{editingOffer ? 'Guardar cambios' : 'Crear oferta'}</Button></DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
};

export default OffersManagementPage;
