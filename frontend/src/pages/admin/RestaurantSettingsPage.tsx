import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, CreditCard, Bell, Shield, Save, Loader2, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import ImageUpload from '@/components/ImageUpload';
import AdminLayout from '@/components/admin/AdminLayout';
import { useRestaurantAuth } from '@/contexts/RestaurantAuthContext';
import { useUpdateRestaurant } from '@/hooks/useData';
import { toast } from 'sonner';

const cuisines = ['Yucateca', 'Mariscos', 'Fusión', 'Internacional', 'Italiana', 'Mexicana', 'Japonesa', 'Otro'];
const priceRanges = [
    { value: '$', label: '$ - Económico' },
    { value: '$$', label: '$$ - Moderado' },
    { value: '$$$', label: '$$$ - Elevado' },
    { value: '$$$$', label: '$$$$ - Premium' },
];

const RestaurantSettingsPage = () => {
    const { restaurant } = useRestaurantAuth();
    const updateMutation = useUpdateRestaurant();

    const [formState, setFormState] = useState({
        // Basic info
        name: restaurant?.name || '',
        description: restaurant?.description || '',
        cuisine: restaurant?.cuisine || '',
        priceRange: restaurant?.priceRange || '',
        image: restaurant?.image || '',
        // Schedule
        openTime: restaurant?.openTime || '12:00',
        closeTime: restaurant?.closeTime || '23:00',
        reservationBuffer: '15',
        maxPartySize: restaurant?.maxGuestCount?.toString() || '12',
        toleranceMinutes: '15',
        requireDeposit: restaurant?.hasDeposit || false,
        depositAmount: '200',
        autoConfirm: false,
        sendReminders: true,
        reminderHours: '24',
    });

    useEffect(() => {
        if (restaurant) {
            setFormState(prev => ({
                ...prev,
                name: restaurant.name || prev.name,
                description: restaurant.description || prev.description,
                cuisine: restaurant.cuisine || prev.cuisine,
                priceRange: restaurant.priceRange || prev.priceRange,
                image: restaurant.image || prev.image,
                openTime: restaurant.openTime || prev.openTime,
                closeTime: restaurant.closeTime || prev.closeTime,
                maxPartySize: restaurant.maxGuestCount?.toString() || prev.maxPartySize,
                requireDeposit: restaurant.hasDeposit || prev.requireDeposit,
            }));
        }
    }, [restaurant]);

    const handleSave = async () => {
        if (!restaurant?.id) return;

        try {
            await updateMutation.mutateAsync({
                restaurantId: restaurant.id,
                updates: {
                    name: formState.name,
                    description: formState.description,
                    cuisine: formState.cuisine,
                    priceRange: formState.priceRange,
                    image: formState.image,
                    openTime: formState.openTime,
                    closeTime: formState.closeTime,
                    maxGuestCount: parseInt(formState.maxPartySize),
                    hasDeposit: formState.requireDeposit,
                }
            });
            toast.success('Configuración guardada correctamente');
        } catch (err) {
            console.error('Error saving settings:', err);
            toast.error('Error al guardar la configuración');
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6 max-w-4xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold">Configuración</h1>
                        <p className="text-muted-foreground">Ajusta los parámetros operativos de tu restaurante</p>
                    </div>
                    <Button onClick={handleSave} className="gap-2 shadow-lg" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Guardar cambios
                    </Button>
                </div>

                <Tabs defaultValue="info" className="space-y-6">
                    <TabsList className="grid grid-cols-2 md:grid-cols-6 gap-2 h-auto p-1 bg-muted/50">
                        <TabsTrigger value="info" className="py-2"><Store className="w-4 h-4 mr-2" />Información</TabsTrigger>
                        <TabsTrigger value="general" className="py-2"><Clock className="w-4 h-4 mr-2" />Horarios</TabsTrigger>
                        <TabsTrigger value="reservations" className="py-2"><Users className="w-4 h-4 mr-2" />Reservas</TabsTrigger>
                        <TabsTrigger value="deposits" className="py-2"><CreditCard className="w-4 h-4 mr-2" />Anticipos</TabsTrigger>
                        <TabsTrigger value="notifications" className="py-2"><Bell className="w-4 h-4 mr-2" />Notificaciones</TabsTrigger>
                        <TabsTrigger value="users" className="py-2"><Shield className="w-4 h-4 mr-2" />Acceso</TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="space-y-6 animate-in fade-in-50 duration-300">
                        <div className="bg-card rounded-2xl p-8 shadow-sm border space-y-8">
                            <div>
                                <h3 className="text-xl font-bold mb-1">Información del Restaurante</h3>
                                <p className="text-sm text-muted-foreground">Datos básicos que aparecerán en la plataforma.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-widest font-bold">Nombre del Restaurante</Label>
                                    <Input
                                        value={formState.name}
                                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                        className="h-12 text-lg font-medium"
                                        placeholder="Ej: La Casa del Chef"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-widest font-bold">Descripción</Label>
                                    <Textarea
                                        value={formState.description}
                                        onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                                        className="min-h-[120px]"
                                        placeholder="Describe tu restaurante, especialidades, ambiente..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase tracking-widest font-bold">Tipo de Cocina</Label>
                                        <Select value={formState.cuisine} onValueChange={(v) => setFormState({ ...formState, cuisine: v })}>
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="Selecciona" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {cuisines.map(cuisine => (
                                                    <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase tracking-widest font-bold">Rango de Precios</Label>
                                        <Select value={formState.priceRange} onValueChange={(v) => setFormState({ ...formState, priceRange: v })}>
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="Selecciona" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {priceRanges.map(range => (
                                                    <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Separator />

                                <ImageUpload
                                    value={formState.image}
                                    onChange={(url) => setFormState({ ...formState, image: url })}
                                    label="Imagen Principal del Restaurante"
                                />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="general" className="space-y-6 animate-in fade-in-50 duration-300">
                        <div className="bg-card rounded-2xl p-8 shadow-sm border space-y-8">
                            <div>
                                <h3 className="text-xl font-bold mb-1">Horarios de Operación</h3>
                                <p className="text-sm text-muted-foreground">Define el rango horario en el que los clientes pueden reservar.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-widest font-bold">Hora de Apertura</Label>
                                    <Input
                                        type="time"
                                        value={formState.openTime}
                                        onChange={(e) => setFormState({ ...formState, openTime: e.target.value })}
                                        className="h-12 text-lg font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-widest font-bold">Hora de Cierre</Label>
                                    <Input
                                        type="time"
                                        value={formState.closeTime}
                                        onChange={(e) => setFormState({ ...formState, closeTime: e.target.value })}
                                        className="h-12 text-lg font-medium"
                                    />
                                </div>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold">Horarios Especiales (Festivos)</h4>
                                    <p className="text-sm text-muted-foreground">Configura excepciones para fechas como Navidad o Año Nuevo.</p>
                                </div>
                                <Button variant="outline">Configurar</Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="reservations" className="space-y-6">
                        <div className="bg-card rounded-2xl p-8 shadow-sm border space-y-8">
                            <h3 className="text-xl font-bold">Políticas de Reservación</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-widest font-bold">Buffer entre reservas (min)</Label>
                                    <Input
                                        type="number"
                                        value={formState.reservationBuffer}
                                        onChange={(e) => setFormState({ ...formState, reservationBuffer: e.target.value })}
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-widest font-bold">Tamaño máximo de grupo</Label>
                                    <Input
                                        type="number"
                                        value={formState.maxPartySize}
                                        onChange={(e) => setFormState({ ...formState, maxPartySize: e.target.value })}
                                        className="h-11"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-widest font-bold">Tolerancia de llegada (min)</Label>
                                <Input
                                    type="number"
                                    value={formState.toleranceMinutes}
                                    onChange={(e) => setFormState({ ...formState, toleranceMinutes: e.target.value })}
                                    className="h-11 border-primary/20"
                                />
                                <p className="text-xs text-muted-foreground">El sistema marcará automáticamente como no-show después de este tiempo.</p>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="font-bold">Confirmación Automática</p>
                                    <p className="text-sm text-muted-foreground">Las reservas se confirman al instante sin intervención del staff.</p>
                                </div>
                                <Switch checked={formState.autoConfirm} onCheckedChange={(checked) => setFormState({ ...formState, autoConfirm: checked })} />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="deposits" className="space-y-6">
                        <div className="bg-card rounded-2xl p-8 shadow-sm border space-y-8">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-bold">Depósitos de Garantía</h3>
                                    <p className="text-sm text-muted-foreground">Reduce el ausentismo solicitando un pago previo.</p>
                                </div>
                                <Switch checked={formState.requireDeposit} onCheckedChange={(checked) => setFormState({ ...formState, requireDeposit: checked })} />
                            </div>

                            {formState.requireDeposit && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6 pt-4 border-t border-dashed">
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase tracking-widest font-bold">Monto por persona (MXN)</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">$</span>
                                            <Input
                                                type="number"
                                                value={formState.depositAmount}
                                                onChange={(e) => setFormState({ ...formState, depositAmount: e.target.value })}
                                                className="pl-8 h-12 text-lg font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="p-4 bg-muted/40 rounded-xl border">
                                        <p className="text-xs font-bold uppercase tracking-widest mb-3 text-muted-foreground">Horarios con depósito</p>
                                        <div className="flex flex-wrap gap-2">
                                            {['19:00', '19:30', '20:00', '20:30', '21:00'].map(t => (
                                                <Badge key={t} className="bg-background text-foreground border h-8 px-3">{t}</Badge>
                                            ))}
                                            <Button variant="ghost" size="sm" className="h-8 border-dashed border-2">Editar...</Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="notifications" className="space-y-6">
                        <div className="bg-card rounded-2xl p-8 shadow-sm border space-y-8">
                            <h3 className="text-xl font-bold">Comunicación con Clientes</h3>
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="font-bold">Recordatorios Automáticos</p>
                                    <p className="text-sm text-muted-foreground">Enviar SMS/Email antes de la cita.</p>
                                </div>
                                <Switch checked={formState.sendReminders} onCheckedChange={(checked) => setFormState({ ...formState, sendReminders: checked })} />
                            </div>
                            {formState.sendReminders && (
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-widest font-bold">Anticipación del recordatorio</Label>
                                    <Select value={formState.reminderHours} onValueChange={(v) => setFormState({ ...formState, reminderHours: v })}>
                                        <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="12">12 horas antes</SelectItem>
                                            <SelectItem value="24">24 horas antes</SelectItem>
                                            <SelectItem value="48">48 horas antes</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="users" className="space-y-6">
                        <div className="bg-card rounded-2xl p-8 shadow-sm border space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold">Control de Acceso</h3>
                                <Button variant="outline" size="sm" className="gap-2"><Plus className="w-4 h-4" />Agregar Staff</Button>
                            </div>
                            <div className="divide-y border rounded-xl overflow-hidden">
                                <div className="flex items-center justify-between p-4 bg-background">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">JD</div>
                                        <div><p className="font-bold text-sm">Juan Díaz</p><p className="text-xs text-muted-foreground">Administrador</p></div>
                                    </div>
                                    <Badge>Titular</Badge>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-background">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center font-bold text-secondary">AL</div>
                                        <div><p className="font-bold text-sm">Ana López</p><p className="text-xs text-muted-foreground">Staff de Piso</p></div>
                                    </div>
                                    <Button variant="ghost" size="sm">Gestionar</Button>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="md:hidden pb-10">
                    <Button onClick={handleSave} className="w-full h-12 text-lg font-bold shadow-xl" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Guardar Cambios
                    </Button>
                </div>
            </div>
        </AdminLayout>
    );
};

// Simple badge and icon fallback to avoid missing exports
const Badge = ({ children, className }: any) => (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", className)}>
        {children}
    </span>
);

const Plus = ({ className }: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="M12 5v14" /></svg>
);

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default RestaurantSettingsPage;
