import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowLeft, Utensils, Calendar, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const ClientLoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, register } = useAuth();
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Login form state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Register form state
    const [registerName, setRegisterName] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPhone, setRegisterPhone] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

    // Get the redirect path from location state or default to home
    const from = (location.state as { from?: string })?.from || '/';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const success = await login(loginEmail, loginPassword);

        if (success) {
            toast({
                title: '¡Bienvenido!',
                description: 'Has iniciado sesión correctamente',
            });
            navigate(from, { replace: true });
        } else {
            toast({
                title: 'Error',
                description: 'Email o contraseña incorrectos',
                variant: 'destructive',
            });
        }
        setIsLoading(false);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (registerPassword !== registerConfirmPassword) {
            toast({
                title: 'Error',
                description: 'Las contraseñas no coinciden',
                variant: 'destructive',
            });
            return;
        }

        if (registerPassword.length < 6) {
            toast({
                title: 'Error',
                description: 'La contraseña debe tener al menos 6 caracteres',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);
        const success = await register(registerName, registerEmail, registerPhone, registerPassword);

        if (success) {
            toast({
                title: '¡Cuenta creada!',
                description: 'Tu cuenta ha sido creada exitosamente',
            });
            navigate(from, { replace: true });
        } else {
            toast({
                title: 'Error',
                description: 'El email ya está registrado',
                variant: 'destructive',
            });
        }
        setIsLoading(false);
    };

    const benefits = [
        { icon: Calendar, title: 'Reserva en segundos', description: 'Selecciona tu mesa favorita visualmente' },
        { icon: MapPin, title: 'Los mejores lugares', description: 'Restaurantes exclusivos de Mérida' },
        { icon: Star, title: 'Gana recompensas', description: 'Acumula reservas y obtén beneficios' },
    ];

    return (
        <div className="min-h-screen bg-background flex">
            {/* Left side - Benefits */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-12 flex-col justify-between relative overflow-hidden"
            >
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
                    <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
                </div>

                <div className="relative z-10">
                    <Link to="/" className="flex items-center gap-2 mb-12">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <Utensils className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-display font-bold">Mesa Feliz</span>
                    </Link>

                    <h1 className="text-4xl font-display font-bold mb-4">
                        Descubre la gastronomía yucateca
                    </h1>
                    <p className="text-xl opacity-90 mb-12">
                        Reserva tu mesa en los mejores restaurantes de Mérida con tan solo unos clics.
                    </p>

                    <div className="space-y-6">
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + index * 0.1 }}
                                className="flex items-start gap-4"
                            >
                                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                                    <benefit.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{benefit.title}</h3>
                                    <p className="opacity-80">{benefit.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10">
                    <p className="text-sm opacity-70">
                        © 2024 Mesa Feliz. Todos los derechos reservados.
                    </p>
                </div>
            </motion.div>

            {/* Right side - Login/Register Form */}
            <div className="flex-1 flex flex-col">
                <div className="p-4">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Volver
                    </Button>
                </div>

                <div className="flex-1 flex items-center justify-center p-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-md"
                    >
                        <div className="text-center mb-8 lg:hidden">
                            <Link to="/" className="inline-flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                                    <Utensils className="w-6 h-6 text-primary-foreground" />
                                </div>
                                <span className="text-2xl font-display font-bold">Mesa Feliz</span>
                            </Link>
                        </div>

                        <Tabs defaultValue="login" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                                <TabsTrigger value="register">Registrarse</TabsTrigger>
                            </TabsList>

                            <TabsContent value="login">
                                <div className="bg-card rounded-2xl p-6 shadow-card border">
                                    <h2 className="text-2xl font-display font-bold mb-2">¡Bienvenido de vuelta!</h2>
                                    <p className="text-muted-foreground mb-6">Ingresa tus datos para continuar</p>

                                    <form onSubmit={handleLogin} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Correo electrónico</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="tu@email.com"
                                                    value={loginEmail}
                                                    onChange={(e) => setLoginEmail(e.target.value)}
                                                    className="pl-10"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password">Contraseña</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    id="password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="••••••••"
                                                    value={loginPassword}
                                                    onChange={(e) => setLoginPassword(e.target.value)}
                                                    className="pl-10 pr-10"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" className="rounded border-muted-foreground" />
                                                <span>Recordarme</span>
                                            </label>
                                            <a href="#" className="text-primary hover:underline">¿Olvidaste tu contraseña?</a>
                                        </div>

                                        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                                            {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
                                        </Button>
                                    </form>

                                    <div className="mt-6 p-4 rounded-lg bg-muted/50 text-sm">
                                        <p className="font-medium mb-1">🔑 Datos de prueba:</p>
                                        <p className="text-muted-foreground">Email: juan@email.com</p>
                                        <p className="text-muted-foreground">Contraseña: 123456</p>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="register">
                                <div className="bg-card rounded-2xl p-6 shadow-card border">
                                    <h2 className="text-2xl font-display font-bold mb-2">Crear cuenta</h2>
                                    <p className="text-muted-foreground mb-6">Únete y reserva en los mejores restaurantes</p>

                                    <form onSubmit={handleRegister} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nombre completo</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    placeholder="Juan García"
                                                    value={registerName}
                                                    onChange={(e) => setRegisterName(e.target.value)}
                                                    className="pl-10"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="reg-email">Correo electrónico</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    id="reg-email"
                                                    type="email"
                                                    placeholder="tu@email.com"
                                                    value={registerEmail}
                                                    onChange={(e) => setRegisterEmail(e.target.value)}
                                                    className="pl-10"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Teléfono</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    placeholder="+52 999 123 4567"
                                                    value={registerPhone}
                                                    onChange={(e) => setRegisterPhone(e.target.value)}
                                                    className="pl-10"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="reg-password">Contraseña</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    id="reg-password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="Mínimo 6 caracteres"
                                                    value={registerPassword}
                                                    onChange={(e) => setRegisterPassword(e.target.value)}
                                                    className="pl-10"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    id="confirm-password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="Repite tu contraseña"
                                                    value={registerConfirmPassword}
                                                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                                                    className="pl-10"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2 text-sm">
                                            <input type="checkbox" className="rounded border-muted-foreground mt-1" required />
                                            <span className="text-muted-foreground">
                                                Acepto los <a href="#" className="text-primary hover:underline">términos de servicio</a> y la <a href="#" className="text-primary hover:underline">política de privacidad</a>
                                            </span>
                                        </div>

                                        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                                            {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
                                        </Button>
                                    </form>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ClientLoginPage;
