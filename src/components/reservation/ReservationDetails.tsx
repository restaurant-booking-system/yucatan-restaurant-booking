import { motion } from 'framer-motion';
import { Heart, Gift, Briefcase, PartyPopper, Utensils, Music, Users as UsersIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export interface ReservationDetailsData {
    occasion: string | null;
    specialRequest: string;
    requiresDeposit?: boolean;
    depositAmount?: number;
}

interface ReservationDetailsProps {
    data: ReservationDetailsData;
    onChange: (data: Partial<ReservationDetailsData>) => void;
    restaurantName: string;
}

const occasions = [
    { id: 'none', label: 'Ninguna', icon: Utensils, color: 'text-gray-600' },
    { id: 'romantic', label: 'Cena Romántica', icon: Heart, color: 'text-pink-600' },
    { id: 'birthday', label: 'Cumpleaños', icon: PartyPopper, color: 'text-purple-600' },
    { id: 'anniversary', label: 'Aniversario', icon: Gift, color: 'text-blue-600' },
    { id: 'business', label: 'Reunión de Negocios', icon: Briefcase, color: 'text-gray-700' },
    { id: 'celebration', label: 'Celebración Especial', icon: Music, color: 'text-orange-600' },
    { id: 'family', label: 'Reunión Familiar', icon: UsersIcon, color: 'text-green-600' },
];

const ReservationDetails = ({ data, onChange, restaurantName }: ReservationDetailsProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Occasion Selection */}
            <div className="space-y-4">
                <Label className="text-lg font-semibold">¿Cuál es la ocasión?</Label>
                <RadioGroup
                    value={data.occasion || 'none'}
                    onValueChange={(value) => onChange({ occasion: value })}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3"
                >
                    {occasions.map((occasion) => (
                        <motion.div
                            key={occasion.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <label
                                htmlFor={occasion.id}
                                className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${data.occasion === occasion.id
                                        ? 'border-primary bg-primary/5'
                                        : 'border-muted hover:border-primary/50 hover:bg-muted/50'
                                    }`}
                            >
                                <RadioGroupItem value={occasion.id} id={occasion.id} />
                                <occasion.icon className={`h-5 w-5 ${occasion.color}`} />
                                <span className="font-medium">{occasion.label}</span>
                            </label>
                        </motion.div>
                    ))}
                </RadioGroup>
            </div>

            {/* Special Requests */}
            <div className="space-y-3">
                <Label htmlFor="special-request" className="text-lg font-semibold">
                    Peticiones Especiales (Opcional)
                </Label>
                <Textarea
                    id="special-request"
                    placeholder="Ejemplo: Mesa cerca de la ventana, silla para bebé, restricciones alimentarias, decoración especial, etc."
                    value={data.specialRequest}
                    onChange={(e) => onChange({ specialRequest: e.target.value })}
                    rows={4}
                    className="resize-none"
                />
                <p className="text-sm text-muted-foreground">
                    {restaurantName} hará su mejor esfuerzo para cumplir tus peticiones, aunque no pueden garantizarse.
                </p>
            </div>

            {/* Deposit Alert */}
            {data.requiresDeposit && (
                <Alert className="border-amber-200 bg-amber-50">
                    <Info className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-900">
                        <p className="font-semibold mb-1">Anticipo Requerido</p>
                        <p className="text-sm">
                            Esta reserva requiere un anticipo de <span className="font-bold">${data.depositAmount}</span> MXN.
                            El anticipo será descontado de tu cuenta final.
                        </p>
                        <p className="text-xs mt-2 text-amber-700">
                            <strong>Política de cancelación:</strong> El anticipo no será reembolsable en caso de no asistir (no-show)
                            o cancelar con menos de 24 horas de anticipación.
                        </p>
                    </AlertDescription>
                </Alert>
            )}
        </motion.div>
    );
};

export default ReservationDetails;
