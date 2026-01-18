import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Store, Mail, Lock, Phone, MapPin, User,
    ChevronRight, Eye, EyeOff, Check, Utensils,
    Clock, Image, FileText, Loader2, CheckCircle2, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import ImageUpload from '@/components/ImageUpload';
import { authService } from '@/services/api';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

const zones = ['Centro', 'Montejo', 'Norte', 'Oriente', 'Poniente'];
const cuisines = ['Yucateca', 'Mariscos', 'Fusión', 'Internacional', 'Italiana', 'Mexicana', 'Japonesa', 'Otro'];
const priceRanges = [
    { value: '$', label: '$ - Económico' },
    { value: '$$', label: '$$ - Moderado' },
    { value: '$$$', label: '$$$ - Elevado' },
    { value: '$$$$', label: '$$$$ - Premium' },
];

type RegistrationStep = 'account' | 'restaurant' | 'details' | 'confirm';

const RestaurantRegisterPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<RegistrationStep>('account');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Email verification state
    const [emailVerified, setEmailVerified] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [isVerifyingCode, setIsVerifyingCode] = useState(false);
    const [verifyError, setVerifyError] = useState('');
    const [codeSent, setCodeSent] = useState(false);
    const [devCode, setDevCode] = useState<string | null>(null); // For development mode

    // Form data
    const [formData, setFormData] = useState({
        // Account
        ownerName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        // Restaurant
        restaurantName: '',
        description: '',
        address: '',
        zone: '',
        cuisine: '',
        priceRange: '',
        latitude: 0,
        longitude: 0,
        // Details
        openTime: '09:00',
        closeTime: '22:00',
        capacity: '',
        imageUrl: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    // Email verification functions
    const handleSendVerificationCode = async () => {
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setErrors(prev => ({ ...prev, email: 'Ingresa un correo válido' }));
            return;
        }

        setIsSendingCode(true);
        try {
            const response = await fetch(`${API_BASE_URL}/verification/send-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email })
            });
            const data = await response.json();

            if (data.success) {
                setCodeSent(true);
                setShowVerifyModal(true);
                setVerifyError('');
                toast.success('Código enviado a tu correo');
                // In development, store the code to show in modal
                if (data.devCode) {
                    setDevCode(data.devCode);
                    console.log('📧 Dev verification code:', data.devCode);
                }
            } else {
                toast.error(data.error || 'Error al enviar código');
            }
        } catch (error) {
            console.error('Error sending verification code:', error);
            toast.error('Error al enviar el código');
        } finally {
            setIsSendingCode(false);
        }
    };

    const handleVerifyCode = async () => {
        const code = verificationCode.join('');
        if (code.length !== 6) {
            setVerifyError('Ingresa el código completo');
            return;
        }

        setIsVerifyingCode(true);
        setVerifyError('');
        try {
            const response = await fetch(`${API_BASE_URL}/verification/verify-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, code })
            });
            const data = await response.json();

            if (data.success && data.verified) {
                setEmailVerified(true);
                setShowVerifyModal(false);
                toast.success('¡Correo verificado exitosamente!');
            } else {
                setVerifyError(data.error || 'Código incorrecto');
            }
        } catch (error) {
            console.error('Error verifying code:', error);
            setVerifyError('Error al verificar el código');
        } finally {
            setIsVerifyingCode(false);
        }
    };

    const handleCodeInput = (index: number, value: string) => {
        if (value.length > 1) value = value.slice(-1);
        if (!/^\d*$/.test(value)) return;

        const newCode = [...verificationCode];
        newCode[index] = value;
        setVerificationCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`code-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
            const prevInput = document.getElementById(`code-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleResendCode = async () => {
        setVerificationCode(['', '', '', '', '', '']);
        setVerifyError('');
        await handleSendVerificationCode();
    };

    // Address change handler
    const handleAddressChange = (address: string, details?: { lat: number; lon: number; zone?: string }) => {
        updateField('address', address);
        if (details) {
            setFormData(prev => ({
                ...prev,
                latitude: details.lat,
                longitude: details.lon,
                zone: details.zone || prev.zone
            }));
        }
    };

    const validateStep = () => {
        const newErrors: Record<string, string> = {};

        if (step === 'account') {
            if (!formData.ownerName.trim()) newErrors.ownerName = 'El nombre es requerido';
            if (!formData.email.trim()) newErrors.email = 'El correo es requerido';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                newErrors.email = 'Correo inválido';
            }
            // Note: email verification is handled in handleNext, not here
            if (!formData.phone.trim()) newErrors.phone = 'El teléfono es requerido';
            if (!formData.password) newErrors.password = 'La contraseña es requerida';
            else if (formData.password.length < 6) {
                newErrors.password = 'Mínimo 6 caracteres';
            }
            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Las contraseñas no coinciden';
            }
        }

        if (step === 'restaurant') {
            if (!formData.restaurantName.trim()) newErrors.restaurantName = 'El nombre del restaurante es requerido';
            if (!formData.address.trim()) newErrors.address = 'La dirección es requerida';
            if (!formData.zone) newErrors.zone = 'Selecciona una zona';
            if (!formData.cuisine) newErrors.cuisine = 'Selecciona un tipo de cocina';
            if (!formData.priceRange) newErrors.priceRange = 'Selecciona un rango de precios';
        }

        if (step === 'details') {
            if (!formData.capacity) newErrors.capacity = 'La capacidad es requerida';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = async () => {
        if (!validateStep()) return;

        // If on step 1 and email not verified, trigger verification
        if (step === 'account' && !emailVerified) {
            await handleSendVerificationCode();
            return; // Don't advance, wait for verification
        }

        const steps: RegistrationStep[] = ['account', 'restaurant', 'details', 'confirm'];
        const currentIndex = steps.indexOf(step);
        if (currentIndex < steps.length - 1) {
            setStep(steps[currentIndex + 1]);
        }
    };

    const handleBack = () => {
        const steps: RegistrationStep[] = ['account', 'restaurant', 'details', 'confirm'];
        const currentIndex = steps.indexOf(step);
        if (currentIndex > 0) {
            setStep(steps[currentIndex - 1]);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setErrors({});

        try {
            const result = await authService.registerRestaurant({
                owner_name: formData.ownerName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                restaurant: {
                    name: formData.restaurantName,
                    description: formData.description,
                    address: formData.address,
                    zone: formData.zone,
                    cuisine: formData.cuisine,
                    price_range: formData.priceRange,
                    open_time: formData.openTime,
                    close_time: formData.closeTime,
                    capacity: parseInt(formData.capacity),
                    image: formData.imageUrl,
                }
            });

            if (result) {
                navigate('/admin/login', {
                    state: { message: '¡Registro exitoso! Por favor inicia sesión.' }
                });
            }
        } catch (error: any) {
            console.error('Registration error:', error);
            setErrors({ submit: error.message || 'Error al registrar. Intenta de nuevo.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const stepTitles: Record<RegistrationStep, { title: string; subtitle: string }> = {
        account: {
            title: 'Crea tu cuenta',
            subtitle: 'Información del propietario o administrador'
        },
        restaurant: {
            title: 'Tu restaurante',
            subtitle: 'Información básica de tu establecimiento'
        },
        details: {
            title: 'Detalles operativos',
            subtitle: 'Horarios y capacidad'
        },
        confirm: {
            title: 'Confirmar registro',
            subtitle: 'Revisa tus datos antes de continuar'
        },
    };

    const progress = (['account', 'restaurant', 'details', 'confirm'].indexOf(step) + 1) * 25;

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="pt-28 pb-20">
                <div className="container mx-auto px-4 max-w-2xl">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8"
                    >
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <Store className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="font-display text-3xl font-bold mb-2">
                            Registra tu Restaurante
                        </h1>
                        <p className="text-muted-foreground">
                            Únete a Mesa Feliz y aumenta tus reservaciones
                        </p>
                    </motion.div>

                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex justify-between text-sm text-muted-foreground mb-2">
                            <span>Paso {['account', 'restaurant', 'details', 'confirm'].indexOf(step) + 1} de 4</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-primary to-secondary"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>

                    {/* Step Title */}
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-6"
                    >
                        <h2 className="font-display text-xl font-semibold">{stepTitles[step].title}</h2>
                        <p className="text-muted-foreground text-sm">{stepTitles[step].subtitle}</p>
                    </motion.div>

                    {/* Form Card */}
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card rounded-2xl p-6 shadow-card"
                    >
                        {/* Step 1: Account */}
                        {step === 'account' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ownerName" className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                        Nombre completo
                                    </Label>
                                    <Input
                                        id="ownerName"
                                        placeholder="Juan Pérez"
                                        value={formData.ownerName}
                                        onChange={(e) => updateField('ownerName', e.target.value)}
                                        className={errors.ownerName ? 'border-destructive' : ''}
                                    />
                                    {errors.ownerName && <p className="text-xs text-destructive">{errors.ownerName}</p>}
                                </div>

                                {/* Email with verification */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                        Correo electrónico
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="correo@ejemplo.com"
                                            value={formData.email}
                                            onChange={(e) => {
                                                updateField('email', e.target.value);
                                                if (emailVerified) setEmailVerified(false);
                                            }}
                                            disabled={emailVerified}
                                            className={`${errors.email ? 'border-destructive' : ''} ${emailVerified ? 'pr-10 bg-green-50 border-green-500' : ''}`}
                                        />
                                        {emailVerified && (
                                            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
                                        )}
                                    </div>
                                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                                    {emailVerified && (
                                        <p className="text-xs text-green-600 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Correo verificado correctamente
                                        </p>
                                    )}
                                    {!emailVerified && !errors.email && (
                                        <p className="text-xs text-muted-foreground">
                                            Se verificará al dar clic en "Continuar"
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-muted-foreground" />
                                        Teléfono
                                    </Label>
                                    <Input
                                        id="phone"
                                        placeholder="+52 999 123 4567"
                                        value={formData.phone}
                                        onChange={(e) => updateField('phone', e.target.value)}
                                        className={errors.phone ? 'border-destructive' : ''}
                                    />
                                    {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-muted-foreground" />
                                        Contraseña
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Mínimo 6 caracteres"
                                            value={formData.password}
                                            onChange={(e) => updateField('password', e.target.value)}
                                            className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Repite tu contraseña"
                                        value={formData.confirmPassword}
                                        onChange={(e) => updateField('confirmPassword', e.target.value)}
                                        className={errors.confirmPassword ? 'border-destructive' : ''}
                                    />
                                    {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Restaurant */}
                        {step === 'restaurant' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="restaurantName" className="flex items-center gap-2">
                                        <Store className="w-4 h-4 text-muted-foreground" />
                                        Nombre del restaurante
                                    </Label>
                                    <Input
                                        id="restaurantName"
                                        placeholder="Ej: La Casa del Chef"
                                        value={formData.restaurantName}
                                        onChange={(e) => updateField('restaurantName', e.target.value)}
                                        className={errors.restaurantName ? 'border-destructive' : ''}
                                    />
                                    {errors.restaurantName && <p className="text-xs text-destructive">{errors.restaurantName}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description" className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-muted-foreground" />
                                        Descripción (opcional)
                                    </Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Describe tu restaurante, especialidades, ambiente..."
                                        value={formData.description}
                                        onChange={(e) => updateField('description', e.target.value)}
                                        className="min-h-[100px]"
                                    />
                                </div>

                                {/* Address with autocomplete */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-muted-foreground" />
                                        Dirección
                                    </Label>
                                    <AddressAutocomplete
                                        value={formData.address}
                                        onChange={handleAddressChange}
                                        placeholder="Busca la dirección de tu restaurante..."
                                        error={!!errors.address}
                                    />
                                    {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                                    <p className="text-xs text-muted-foreground">
                                        Escribe para buscar con OpenStreetMap
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Zona</Label>
                                        <Select value={formData.zone} onValueChange={(v) => updateField('zone', v)}>
                                            <SelectTrigger className={errors.zone ? 'border-destructive' : ''}>
                                                <SelectValue placeholder="Selecciona" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {zones.map(zone => (
                                                    <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.zone && <p className="text-xs text-destructive">{errors.zone}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Tipo de cocina</Label>
                                        <Select value={formData.cuisine} onValueChange={(v) => updateField('cuisine', v)}>
                                            <SelectTrigger className={errors.cuisine ? 'border-destructive' : ''}>
                                                <SelectValue placeholder="Selecciona" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {cuisines.map(cuisine => (
                                                    <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.cuisine && <p className="text-xs text-destructive">{errors.cuisine}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Utensils className="w-4 h-4 text-muted-foreground" />
                                        Rango de precios
                                    </Label>
                                    <Select value={formData.priceRange} onValueChange={(v) => updateField('priceRange', v)}>
                                        <SelectTrigger className={errors.priceRange ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Selecciona un rango" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {priceRanges.map(range => (
                                                <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.priceRange && <p className="text-xs text-destructive">{errors.priceRange}</p>}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Details */}
                        {step === 'details' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="openTime" className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-muted-foreground" />
                                            Hora de apertura
                                        </Label>
                                        <Input
                                            id="openTime"
                                            type="time"
                                            value={formData.openTime}
                                            onChange={(e) => updateField('openTime', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="closeTime">Hora de cierre</Label>
                                        <Input
                                            id="closeTime"
                                            type="time"
                                            value={formData.closeTime}
                                            onChange={(e) => updateField('closeTime', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="capacity">Capacidad total (personas)</Label>
                                    <Input
                                        id="capacity"
                                        type="number"
                                        placeholder="Ej: 50"
                                        value={formData.capacity}
                                        onChange={(e) => updateField('capacity', e.target.value)}
                                        className={errors.capacity ? 'border-destructive' : ''}
                                    />
                                    {errors.capacity && <p className="text-xs text-destructive">{errors.capacity}</p>}
                                </div>

                                <ImageUpload
                                    value={formData.imageUrl}
                                    onChange={(url) => updateField('imageUrl', url)}
                                    label="Imagen del restaurante (opcional)"
                                />
                            </div>
                        )}

                        {/* Step 4: Confirm */}
                        {step === 'confirm' && (
                            <div className="space-y-6">
                                <div className="bg-muted rounded-xl p-4">
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Cuenta
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <span className="text-muted-foreground">Nombre:</span>
                                        <span>{formData.ownerName}</span>
                                        <span className="text-muted-foreground">Email:</span>
                                        <span className="flex items-center gap-1">
                                            {formData.email}
                                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                                        </span>
                                        <span className="text-muted-foreground">Teléfono:</span>
                                        <span>{formData.phone}</span>
                                    </div>
                                </div>

                                <div className="bg-muted rounded-xl p-4">
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <Store className="w-4 h-4" />
                                        Restaurante
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <span className="text-muted-foreground">Nombre:</span>
                                        <span>{formData.restaurantName}</span>
                                        <span className="text-muted-foreground">Dirección:</span>
                                        <span className="line-clamp-1">{formData.address}</span>
                                        <span className="text-muted-foreground">Zona:</span>
                                        <span>{formData.zone}</span>
                                        <span className="text-muted-foreground">Cocina:</span>
                                        <span>{formData.cuisine}</span>
                                        <span className="text-muted-foreground">Precios:</span>
                                        <span>{formData.priceRange}</span>
                                    </div>
                                </div>

                                <div className="bg-muted rounded-xl p-4">
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Horario
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <span className="text-muted-foreground">Apertura:</span>
                                        <span>{formData.openTime}</span>
                                        <span className="text-muted-foreground">Cierre:</span>
                                        <span>{formData.closeTime}</span>
                                        <span className="text-muted-foreground">Capacidad:</span>
                                        <span>{formData.capacity} personas</span>
                                    </div>
                                </div>

                                {errors.submit && (
                                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
                                        {errors.submit}
                                    </div>
                                )}

                                <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
                                    <p className="text-sm">
                                        <Check className="w-4 h-4 inline mr-2 text-primary" />
                                        Al registrarte aceptas los <Link to="/terminos" className="text-primary hover:underline">Términos y Condiciones</Link> de Mesa Feliz.
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Navigation Buttons */}
                    <div className="mt-6 flex gap-4">
                        {step !== 'account' && (
                            <Button variant="outline" onClick={handleBack} className="flex-1">
                                Anterior
                            </Button>
                        )}
                        {step !== 'confirm' ? (
                            <Button onClick={handleNext} className="flex-1 gap-2">
                                Continuar
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1 gap-2"
                            >
                                {isSubmitting ? 'Registrando...' : 'Completar registro'}
                            </Button>
                        )}
                    </div>

                    {/* Login Link */}
                    <p className="text-center text-sm text-muted-foreground mt-6">
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/admin/login" className="text-primary hover:underline font-medium">
                            Inicia sesión aquí
                        </Link>
                    </p>
                </div>
            </main>

            <Footer />

            {/* Email Verification Modal */}
            <Dialog open={showVerifyModal} onOpenChange={setShowVerifyModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center">Verifica tu correo</DialogTitle>
                        <DialogDescription className="text-center">
                            Enviamos un código de 6 dígitos a<br />
                            <strong>{formData.email}</strong>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* 6-digit code input */}
                        <div className="flex justify-center gap-2">
                            {verificationCode.map((digit, index) => (
                                <Input
                                    key={index}
                                    id={`code-${index}`}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleCodeInput(index, e.target.value)}
                                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                                    className="w-12 h-14 text-center text-2xl font-bold"
                                />
                            ))}
                        </div>

                        {/* Development mode: Show the code */}
                        {devCode && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                                <p className="text-xs text-amber-600 mb-1">🔧 Modo desarrollo - Código:</p>
                                <p className="text-2xl font-bold text-amber-800 tracking-widest">{devCode}</p>
                            </div>
                        )}

                        {verifyError && (
                            <p className="text-sm text-destructive text-center">{verifyError}</p>
                        )}

                        <Button
                            onClick={handleVerifyCode}
                            disabled={isVerifyingCode || verificationCode.join('').length !== 6}
                            className="w-full"
                        >
                            {isVerifyingCode ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Check className="w-4 h-4 mr-2" />
                            )}
                            Verificar código
                        </Button>

                        <div className="text-center">
                            <Button
                                variant="link"
                                onClick={handleResendCode}
                                disabled={isSendingCode}
                                className="text-sm"
                            >
                                ¿No recibiste el código? Reenviar
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default RestaurantRegisterPage;
