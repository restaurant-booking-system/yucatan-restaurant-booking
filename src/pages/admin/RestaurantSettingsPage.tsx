import { useState } from 'react';
import { Settings, Clock, Users, CreditCard, Bell, Grid3X3, Shield, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/components/admin/AdminLayout';

const RestaurantSettingsPage = () => {
    const [settings, setSettings] = useState({
        openTime: '12:00', closeTime: '23:00',
        reservationBuffer: '15', maxPartySize: '12',
        toleranceMinutes: '15', requireDeposit: true,
        depositAmount: '200', depositHours: ['19:00', '20:00', '21:00'],
        autoConfirm: false, sendReminders: true,
        reminderHours: '24',
    });

    return (
        <AdminLayout>
            <div className="space-y-6 max-w-4xl">
                <div><h1 className="text-3xl font-display font-bold">Configuración</h1><p className="text-muted-foreground">Ajusta las preferencias de tu restaurante</p></div>

                <Tabs defaultValue="general" className="space-y-6">
                    <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        <TabsTrigger value="general"><Clock className="w-4 h-4 mr-2" />Horarios</TabsTrigger>
                        <TabsTrigger value="reservations"><Users className="w-4 h-4 mr-2" />Reservas</TabsTrigger>
                        <TabsTrigger value="deposits"><CreditCard className="w-4 h-4 mr-2" />Anticipos</TabsTrigger>
                        <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-2" />Notificaciones</TabsTrigger>
                        <TabsTrigger value="users"><Shield className="w-4 h-4 mr-2" />Usuarios</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-6">
                        <div className="bg-card rounded-xl p-6 shadow-card space-y-6">
                            <h3 className="text-xl font-semibold">Horarios de operación</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label>Hora de apertura</Label><Input type="time" value={settings.openTime} onChange={(e) => setSettings({ ...settings, openTime: e.target.value })} /></div>
                                <div><Label>Hora de cierre</Label><Input type="time" value={settings.closeTime} onChange={(e) => setSettings({ ...settings, closeTime: e.target.value })} /></div>
                            </div>
                            <Separator />
                            <h4 className="font-medium">Horarios especiales</h4>
                            <p className="text-sm text-muted-foreground">Configura horarios diferentes para días específicos</p>
                            <Button variant="outline">Agregar horario especial</Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="reservations" className="space-y-6">
                        <div className="bg-card rounded-xl p-6 shadow-card space-y-6">
                            <h3 className="text-xl font-semibold">Configuración de reservas</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label>Tiempo entre reservas (min)</Label><Input type="number" value={settings.reservationBuffer} onChange={(e) => setSettings({ ...settings, reservationBuffer: e.target.value })} /></div>
                                <div><Label>Tamaño máximo de grupo</Label><Input type="number" value={settings.maxPartySize} onChange={(e) => setSettings({ ...settings, maxPartySize: e.target.value })} /></div>
                            </div>
                            <div><Label>Tolerancia de llegada (min)</Label><Input type="number" value={settings.toleranceMinutes} onChange={(e) => setSettings({ ...settings, toleranceMinutes: e.target.value })} /><p className="text-sm text-muted-foreground mt-1">Tiempo de espera antes de marcar como no-show</p></div>
                            <Separator />
                            <div className="flex items-center justify-between"><div><p className="font-medium">Confirmación automática</p><p className="text-sm text-muted-foreground">Confirmar reservas automáticamente sin revisión manual</p></div><Switch checked={settings.autoConfirm} onCheckedChange={(checked) => setSettings({ ...settings, autoConfirm: checked })} /></div>
                        </div>
                    </TabsContent>

                    <TabsContent value="deposits" className="space-y-6">
                        <div className="bg-card rounded-xl p-6 shadow-card space-y-6">
                            <h3 className="text-xl font-semibold">Configuración de anticipos</h3>
                            <div className="flex items-center justify-between"><div><p className="font-medium">Requerir anticipo</p><p className="text-sm text-muted-foreground">Solicitar anticipo para horarios pico</p></div><Switch checked={settings.requireDeposit} onCheckedChange={(checked) => setSettings({ ...settings, requireDeposit: checked })} /></div>
                            {settings.requireDeposit && (
                                <>
                                    <div><Label>Monto del anticipo (MXN)</Label><Input type="number" value={settings.depositAmount} onChange={(e) => setSettings({ ...settings, depositAmount: e.target.value })} /></div>
                                    <div><Label>Horarios que requieren anticipo</Label><p className="text-sm text-muted-foreground mb-2">19:00, 20:00, 21:00</p><Button variant="outline">Editar horarios</Button></div>
                                </>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="notifications" className="space-y-6">
                        <div className="bg-card rounded-xl p-6 shadow-card space-y-6">
                            <h3 className="text-xl font-semibold">Notificaciones</h3>
                            <div className="flex items-center justify-between"><div><p className="font-medium">Enviar recordatorios</p><p className="text-sm text-muted-foreground">Recordar a clientes de su reserva</p></div><Switch checked={settings.sendReminders} onCheckedChange={(checked) => setSettings({ ...settings, sendReminders: checked })} /></div>
                            {settings.sendReminders && (
                                <div><Label>Horas antes del recordatorio</Label><Select value={settings.reminderHours} onValueChange={(v) => setSettings({ ...settings, reminderHours: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="12">12 horas</SelectItem><SelectItem value="24">24 horas</SelectItem><SelectItem value="48">48 horas</SelectItem></SelectContent></Select></div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="users" className="space-y-6">
                        <div className="bg-card rounded-xl p-6 shadow-card space-y-6">
                            <h3 className="text-xl font-semibold">Usuarios del sistema</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50"><div><p className="font-medium">Juan Díaz</p><p className="text-sm text-muted-foreground">Gerente</p></div><Button variant="outline" size="sm">Editar</Button></div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50"><div><p className="font-medium">Ana López</p><p className="text-sm text-muted-foreground">Staff</p></div><Button variant="outline" size="sm">Editar</Button></div>
                            </div>
                            <Button variant="outline">Agregar usuario</Button>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end"><Button className="gap-2"><Save className="w-4 h-4" />Guardar cambios</Button></div>
            </div>
        </AdminLayout>
    );
};

export default RestaurantSettingsPage;
