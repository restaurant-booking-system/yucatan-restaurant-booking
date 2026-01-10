import { useState, ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Calendar, Grid3X3, Users, ClipboardList,
    Tag, UtensilsCrossed, Star, BarChart3, Sparkles, Settings,
    ChevronLeft, ChevronRight, Menu, X, Bell, LogOut, ChefHat,
    User, HelpCircle, Moon, Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
    children: ReactNode;
}

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Calendar, label: 'Reservas', path: '/admin/reservas', badge: '4' },
    { icon: Grid3X3, label: 'Mapa de Mesas', path: '/admin/mesas' },
    { icon: Users, label: 'Registro Llegada', path: '/admin/llegadas' },
    { icon: ClipboardList, label: 'Lista de Espera', path: '/admin/espera' },
    { icon: Tag, label: 'Ofertas', path: '/admin/ofertas', badge: '2' },
    { icon: UtensilsCrossed, label: 'Menú Digital', path: '/admin/menu' },
    { icon: Star, label: 'Opiniones', path: '/admin/opiniones' },
    { icon: BarChart3, label: 'Reportes', path: '/admin/reportes' },
    { icon: Sparkles, label: 'IA Sugerencias', path: '/admin/ia-sugerencias' },
    { icon: Settings, label: 'Configuración', path: '/admin/configuracion' },
];

const mockNotifications = [
    { id: 1, title: 'Nueva reserva', message: 'María García para las 20:00', time: '5 min' },
    { id: 2, title: 'Confirmación pendiente', message: 'Mesa 5 sin confirmar', time: '15 min' },
    { id: 3, title: 'Cliente llegó', message: 'Reserva #1234 - Mesa 3', time: '30 min' },
];

const AdminLayout = ({ children }: AdminLayoutProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    const handleLogout = () => {
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    'hidden lg:flex flex-col fixed left-0 top-0 h-full bg-sidebar text-sidebar-foreground z-50 transition-all duration-300',
                    isCollapsed ? 'w-20' : 'w-64'
                )}
            >
                {/* Logo */}
                <div className="p-4 border-b border-sidebar-border">
                    <Link to="/admin/dashboard" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center flex-shrink-0">
                            <ChefHat className="w-6 h-6 text-sidebar-primary-foreground" />
                        </div>
                        <AnimatePresence>
                            {!isCollapsed && (
                                <motion.div
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="overflow-hidden"
                                >
                                    <h1 className="text-lg font-display font-bold whitespace-nowrap">Mesa Feliz</h1>
                                    <p className="text-xs text-sidebar-foreground/60">Admin Panel</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                                'hover:bg-sidebar-accent',
                                isActive(item.path) && 'bg-sidebar-accent'
                            )}
                        >
                            <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive(item.path) && 'text-sidebar-ring')} />
                            <AnimatePresence>
                                {!isCollapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="flex-1 whitespace-nowrap"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                            {item.badge && !isCollapsed && (
                                <Badge className="bg-sidebar-ring text-sidebar-primary-foreground text-xs">
                                    {item.badge}
                                </Badge>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Collapse Button */}
                <div className="p-4 border-t border-sidebar-border">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="w-full justify-center text-sidebar-foreground hover:bg-sidebar-accent"
                    >
                        {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </Button>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'tween' }}
                            className="fixed left-0 top-0 h-full w-64 bg-sidebar text-sidebar-foreground z-50 lg:hidden"
                        >
                            {/* Mobile Header */}
                            <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
                                        <ChefHat className="w-6 h-6 text-sidebar-primary-foreground" />
                                    </div>
                                    <div>
                                        <h1 className="text-lg font-display font-bold">Mesa Feliz</h1>
                                        <p className="text-xs text-sidebar-foreground/60">Admin Panel</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsMobileOpen(false)}
                                    className="text-sidebar-foreground"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* Mobile Navigation */}
                            <nav className="py-4 px-2 space-y-1">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsMobileOpen(false)}
                                        className={cn(
                                            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                                            'hover:bg-sidebar-accent',
                                            isActive(item.path) && 'bg-sidebar-accent'
                                        )}
                                    >
                                        <item.icon className={cn('w-5 h-5', isActive(item.path) && 'text-sidebar-ring')} />
                                        <span className="flex-1">{item.label}</span>
                                        {item.badge && (
                                            <Badge className="bg-sidebar-ring text-sidebar-primary-foreground text-xs">
                                                {item.badge}
                                            </Badge>
                                        )}
                                    </Link>
                                ))}
                            </nav>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className={cn('flex-1 flex flex-col transition-all duration-300', isCollapsed ? 'lg:ml-20' : 'lg:ml-64')}>
                {/* Top Header */}
                <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b">
                    <div className="flex items-center justify-between px-4 py-3">
                        {/* Mobile Menu Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setIsMobileOpen(true)}
                        >
                            <Menu className="w-5 h-5" />
                        </Button>

                        {/* Breadcrumb - Desktop only */}
                        <div className="hidden lg:flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Panel</span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">
                                {menuItems.find(item => isActive(item.path))?.label || 'Dashboard'}
                            </span>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2">
                            {/* Theme Toggle */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsDarkMode(!isDarkMode)}
                            >
                                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </Button>

                            {/* Help */}
                            <Button variant="ghost" size="icon">
                                <HelpCircle className="w-5 h-5" />
                            </Button>

                            {/* Notifications */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative">
                                        <Bell className="w-5 h-5" />
                                        <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-80">
                                    <div className="p-2 border-b">
                                        <h3 className="font-semibold">Notificaciones</h3>
                                    </div>
                                    {mockNotifications.map((notif) => (
                                        <DropdownMenuItem key={notif.id} className="flex-col items-start p-3">
                                            <span className="font-medium">{notif.title}</span>
                                            <span className="text-sm text-muted-foreground">{notif.message}</span>
                                            <span className="text-xs text-muted-foreground mt-1">{notif.time}</span>
                                        </DropdownMenuItem>
                                    ))}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="justify-center text-primary">
                                        Ver todas las notificaciones
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* User Menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="gap-2">
                                        <Avatar className="w-8 h-8">
                                            <AvatarImage src="" />
                                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">JD</AvatarFallback>
                                        </Avatar>
                                        <span className="hidden md:inline font-medium">Juan Díaz</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <div className="p-2 border-b">
                                        <p className="font-medium">Juan Díaz</p>
                                        <p className="text-sm text-muted-foreground">Gerente</p>
                                    </div>
                                    <DropdownMenuItem className="gap-2">
                                        <User className="w-4 h-4" />
                                        Mi Perfil
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="gap-2">
                                        <Settings className="w-4 h-4" />
                                        Configuración
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="gap-2 text-destructive">
                                        <LogOut className="w-4 h-4" />
                                        Cerrar Sesión
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
