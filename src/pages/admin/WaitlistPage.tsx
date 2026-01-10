import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, Phone, Plus, UserPlus, Bell, Check, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/components/admin/AdminLayout';

const mockWaitlist = [
    { id: 1, name: 'Juan Pérez', phone: '+52 999 111 2222', guests: 2, waitTime: 15, priority: 1 },
    { id: 2, name: 'Sofia Ramírez', phone: '+52 999 333 4444', guests: 4, waitTime: 10, priority: 2 },
    { id: 3, name: 'Miguel Ángel', phone: '+52 999 555 6666', guests: 6, waitTime: 5, priority: 3 },
    { id: 4, name: 'Carmen López', phone: '+52 999 777 8888', guests: 2, waitTime: 2, priority: 4 },
];

const WaitlistPage = () => {
    const [waitlist, setWaitlist] = useState(mockWaitlist);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', guests: '2' });

    const handleAddCustomer = () => {
        const newItem = { id: Date.now(), name: newCustomer.name, phone: newCustomer.phone, guests: parseInt(newCustomer.guests), waitTime: 0, priority: waitlist.length + 1 };
        setWaitlist([...waitlist, newItem]);
        setNewCustomer({ name: '', phone: '', guests: '2' });
        setIsAddOpen(false);
    };

    const handleMovePriority = (id: number, direction: 'up' | 'down') => {
        const index = waitlist.findIndex(w => w.id === id);
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === waitlist.length - 1)) return;
        const newList = [...waitlist];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newList[index], newList[swapIndex]] = [newList[swapIndex], newList[index]];
        newList.forEach((item, i) => item.priority = i + 1);
        setWaitlist(newList);
    };

    const handleNotify = (id: number) => { alert(`Notificando al cliente #${id}`); };
    const handleAssign = (id: number) => { setWaitlist(waitlist.filter(w => w.id !== id)); };
    const handleRemove = (id: number) => { setWaitlist(waitlist.filter(w => w.id !== id)); };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div><h1 className="text-3xl font-display font-bold">Lista de Espera</h1><p className="text-muted-foreground">{waitlist.length} clientes esperando</p></div>
                    <Button onClick={() => setIsAddOpen(true)} className="gap-2"><UserPlus className="w-4 h-4" />Agregar cliente</Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-primary/10 rounded-xl p-4 text-center border border-primary/20"><Users className="w-6 h-6 text-primary mx-auto mb-2" /><p className="text-2xl font-bold">{waitlist.length}</p><p className="text-sm">En espera</p></div>
                    <div className="bg-warning/10 rounded-xl p-4 text-center border border-warning/20"><Clock className="w-6 h-6 text-warning mx-auto mb-2" /><p className="text-2xl font-bold">{waitlist.length > 0 ? Math.max(...waitlist.map(w => w.waitTime)) : 0}</p><p className="text-sm">Min. espera máx.</p></div>
                    <div className="bg-success/10 rounded-xl p-4 text-center border border-success/20"><Check className="w-6 h-6 text-success mx-auto mb-2" /><p className="text-2xl font-bold">{waitlist.reduce((sum, w) => sum + w.guests, 0)}</p><p className="text-sm">Total personas</p></div>
                </div>

                <div className="bg-card rounded-xl shadow-card overflow-hidden">
                    <div className="p-4 border-b bg-muted/50"><h2 className="font-semibold">Cola de espera (ordenada por prioridad)</h2></div>
                    {waitlist.length === 0 ? (
                        <div className="p-12 text-center"><Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" /><p className="text-muted-foreground">No hay clientes en espera</p></div>
                    ) : (
                        <div className="divide-y">
                            {waitlist.map((customer, index) => (
                                <motion.div key={customer.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 flex items-center gap-4 hover:bg-muted/30">
                                    <div className="flex flex-col gap-1">
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleMovePriority(customer.id, 'up')} disabled={index === 0}><ChevronUp className="w-4 h-4" /></Button>
                                        <span className="text-center font-bold text-lg text-muted-foreground">{customer.priority}</span>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleMovePriority(customer.id, 'down')} disabled={index === waitlist.length - 1}><ChevronDown className="w-4 h-4" /></Button>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold">{customer.name}</p>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2"><Phone className="w-3 h-3" />{customer.phone}</p>
                                    </div>
                                    <div className="text-center"><Badge variant="outline">{customer.guests} personas</Badge></div>
                                    <div className="text-center"><p className="text-lg font-bold">{customer.waitTime}</p><p className="text-xs text-muted-foreground">min</p></div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleNotify(customer.id)}><Bell className="w-4 h-4" /></Button>
                                        <Button size="sm" onClick={() => handleAssign(customer.id)}><Check className="w-4 h-4 mr-1" />Asignar</Button>
                                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleRemove(customer.id)}><X className="w-4 h-4" /></Button>
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
                        <DialogFooter><Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancelar</Button><Button onClick={handleAddCustomer} disabled={!newCustomer.name || !newCustomer.phone}><Plus className="w-4 h-4 mr-2" />Agregar</Button></DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
};

export default WaitlistPage;
