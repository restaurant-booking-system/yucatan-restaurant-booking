import { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Search, Check, Clock, AlertCircle, User, Phone, Users, MapPin, Scan, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/admin/AdminLayout';
import { cn } from '@/lib/utils';

const mockArrivals = [
    { id: 'RES-001', customerName: 'María García', phone: '+52 999 123 4567', time: '13:00', guests: 2, mesa: 3, status: 'waiting', qrCode: 'QR-ABC123' },
    { id: 'RES-002', customerName: 'Carlos López', phone: '+52 999 234 5678', time: '13:30', guests: 4, mesa: 5, status: 'waiting', qrCode: 'QR-DEF456' },
    { id: 'RES-003', customerName: 'Ana Martínez', phone: '+52 999 345 6789', time: '12:30', guests: 2, mesa: 1, status: 'arrived', qrCode: 'QR-GHI789', arrivedAt: '12:25' },
    { id: 'RES-004', customerName: 'Roberto Sánchez', phone: '+52 999 456 7890', time: '12:00', guests: 6, mesa: 7, status: 'arrived', qrCode: 'QR-JKL012', arrivedAt: '12:05' },
    { id: 'RES-005', customerName: 'Laura Torres', phone: '+52 999 567 8901', time: '11:30', guests: 2, mesa: 2, status: 'noshow', qrCode: 'QR-MNO345' },
];

const ArrivalRegistrationPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedArrival, setSelectedArrival] = useState<typeof mockArrivals[0] | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);

    const waiting = mockArrivals.filter(a => a.status === 'waiting');
    const arrived = mockArrivals.filter(a => a.status === 'arrived');
    const noShows = mockArrivals.filter(a => a.status === 'noshow');

    const handleConfirm = () => {
        setIsConfirmed(true);
        setTimeout(() => { setIsConfirmOpen(false); setIsConfirmed(false); }, 2000);
    };

    const ArrivalCard = ({ arrival }: { arrival: typeof mockArrivals[0] }) => (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={cn('p-4 rounded-xl border cursor-pointer hover:shadow-md',
                arrival.status === 'waiting' && 'bg-warning/5 border-warning/20',
                arrival.status === 'arrived' && 'bg-success/5 border-success/20',
                arrival.status === 'noshow' && 'bg-destructive/5 border-destructive/20 opacity-60'
            )}
            onClick={() => { if (arrival.status === 'waiting') { setSelectedArrival(arrival); setIsConfirmOpen(true); } }}>
            <div className="flex justify-between mb-3">
                <div>
                    <div className="flex items-center gap-2"><User className="w-4 h-4" /><span className="font-semibold">{arrival.customerName}</span></div>
                    <p className="text-sm text-muted-foreground">{arrival.phone}</p>
                </div>
                <Badge className={arrival.status === 'arrived' ? 'bg-success' : arrival.status === 'waiting' ? 'bg-warning' : 'bg-destructive'}>
                    {arrival.status === 'arrived' ? 'Llegó' : arrival.status === 'waiting' ? 'Esperando' : 'No-show'}
                </Badge>
            </div>
            <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{arrival.time}</span>
                <span className="flex items-center gap-1"><Users className="w-4 h-4" />{arrival.guests}</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />Mesa {arrival.mesa}</span>
            </div>
            {arrival.status === 'waiting' && <Button className="w-full mt-3 gap-2"><Check className="w-4 h-4" />Marcar llegada</Button>}
        </motion.div>
    );

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div><h1 className="text-3xl font-display font-bold">Registro de Llegadas</h1><p className="text-muted-foreground">{waiting.length} esperando • {arrived.length} llegaron</p></div>
                    <Button onClick={() => setIsScannerOpen(true)} className="gap-2"><QrCode className="w-5 h-5" />Escanear QR</Button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-warning/10 rounded-xl p-4 text-center border border-warning/20"><Clock className="w-6 h-6 text-warning mx-auto mb-2" /><p className="text-2xl font-bold text-warning">{waiting.length}</p><p className="text-sm">Esperando</p></div>
                    <div className="bg-success/10 rounded-xl p-4 text-center border border-success/20"><Check className="w-6 h-6 text-success mx-auto mb-2" /><p className="text-2xl font-bold text-success">{arrived.length}</p><p className="text-sm">Llegaron</p></div>
                    <div className="bg-destructive/10 rounded-xl p-4 text-center border border-destructive/20"><AlertCircle className="w-6 h-6 text-destructive mx-auto mb-2" /><p className="text-2xl font-bold text-destructive">{noShows.length}</p><p className="text-sm">No-shows</p></div>
                </div>

                <Tabs defaultValue="waiting">
                    <TabsList><TabsTrigger value="waiting">Esperando ({waiting.length})</TabsTrigger><TabsTrigger value="arrived">Llegaron ({arrived.length})</TabsTrigger><TabsTrigger value="noshow">No-shows ({noShows.length})</TabsTrigger></TabsList>
                    <TabsContent value="waiting" className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">{waiting.map(a => <ArrivalCard key={a.id} arrival={a} />)}</TabsContent>
                    <TabsContent value="arrived" className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">{arrived.map(a => <ArrivalCard key={a.id} arrival={a} />)}</TabsContent>
                    <TabsContent value="noshow" className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">{noShows.map(a => <ArrivalCard key={a.id} arrival={a} />)}</TabsContent>
                </Tabs>

                <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader><DialogTitle>Escanear QR</DialogTitle></DialogHeader>
                        <div className="aspect-square bg-muted rounded-xl flex items-center justify-center"><Camera className="w-12 h-12 text-muted-foreground" /></div>
                        <DialogFooter><Button variant="outline" onClick={() => setIsScannerOpen(false)}>Cancelar</Button><Button onClick={() => { setIsScannerOpen(false); setSelectedArrival(waiting[0]); setIsConfirmOpen(true); }}>Simular</Button></DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                    <DialogContent>{selectedArrival && (isConfirmed ? <div className="text-center py-8"><Check className="w-16 h-16 text-success mx-auto mb-4" /><h2 className="text-2xl font-bold">¡Llegada confirmada!</h2></div> : <>
                        <DialogHeader><DialogTitle>Confirmar llegada</DialogTitle></DialogHeader>
                        <div className="p-4 bg-card rounded-xl border"><p className="font-semibold text-lg">{selectedArrival.customerName}</p><p className="text-muted-foreground">{selectedArrival.phone}</p><div className="grid grid-cols-3 gap-4 mt-4 text-center"><div><p className="text-xl font-bold">{selectedArrival.time}</p><p className="text-sm">Hora</p></div><div><p className="text-xl font-bold">{selectedArrival.guests}</p><p className="text-sm">Personas</p></div><div><p className="text-xl font-bold">{selectedArrival.mesa}</p><p className="text-sm">Mesa</p></div></div></div>
                        <DialogFooter><Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Cancelar</Button><Button onClick={handleConfirm}><Check className="w-4 h-4 mr-2" />Confirmar</Button></DialogFooter>
                    </>)}</DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
};

export default ArrivalRegistrationPage;
