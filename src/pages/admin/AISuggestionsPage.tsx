import { motion } from 'framer-motion';
import { Sparkles, Lightbulb, TrendingUp, Clock, Users, AlertTriangle, Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import AdminLayout from '@/components/admin/AdminLayout';
import { cn } from '@/lib/utils';

const suggestions = [
    { id: 1, category: 'ocupacion', priority: 'high', title: 'Aumentar personal los sábados', description: 'En las últimas 4 semanas, los tiempos de espera aumentaron un 25% los sábados entre 20:00-22:00. Considera agregar un mesero adicional.', impact: 'Alto', confidence: 92, status: 'new' },
    { id: 2, category: 'ofertas', priority: 'medium', title: 'Oferta para días entre semana', description: 'La ocupación de lunes a miércoles es 40% menor. Una promoción de 15% podría aumentar las reservas en un 20% estimado.', impact: 'Medio', confidence: 78, status: 'new' },
    { id: 3, category: 'operacion', priority: 'high', title: 'Optimizar distribución de mesas', description: 'El 35% de las reservas son para 2 personas, pero solo el 20% de mesas son para parejas. Considera convertir la mesa 8 (4p) a dos mesas para 2.', impact: 'Alto', confidence: 85, status: 'applied' },
    { id: 4, category: 'noshow', priority: 'medium', title: 'Implementar confirmación 24h antes', description: 'Los no-shows aumentaron 15% este mes. Un recordatorio automático 24h antes podría reducirlos en un 40%.', impact: 'Medio', confidence: 88, status: 'new' },
    { id: 5, category: 'menu', priority: 'low', title: 'Destacar platillo más rentable', description: 'El Tikin Xic tiene el margen más alto (45%) pero solo representa el 8% de ventas. Considera destacarlo en el menú.', impact: 'Bajo', confidence: 72, status: 'dismissed' },
];

const AISuggestionsPage = () => {
    const newCount = suggestions.filter(s => s.status === 'new').length;

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'high': return <Badge className="bg-destructive">Alta prioridad</Badge>;
            case 'medium': return <Badge className="bg-warning">Media</Badge>;
            case 'low': return <Badge variant="outline">Baja</Badge>;
            default: return null;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'applied': return <Badge className="bg-success">Aplicada</Badge>;
            case 'dismissed': return <Badge variant="outline" className="opacity-50">Descartada</Badge>;
            default: return null;
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'ocupacion': return <Users className="w-5 h-5" />;
            case 'ofertas': return <TrendingUp className="w-5 h-5" />;
            case 'operacion': return <Clock className="w-5 h-5" />;
            case 'noshow': return <AlertTriangle className="w-5 h-5" />;
            default: return <Lightbulb className="w-5 h-5" />;
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3"><Sparkles className="w-8 h-8 text-primary" /><div><h1 className="text-3xl font-display font-bold">Sugerencias IA</h1><p className="text-muted-foreground">{newCount} nuevas sugerencias para ti</p></div></div>
                </div>

                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-primary/20">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0"><Sparkles className="w-6 h-6 text-primary-foreground" /></div>
                        <div>
                            <h3 className="text-xl font-display font-semibold mb-2">Asistente Inteligente</h3>
                            <p className="text-muted-foreground">Analizamos continuamente tus datos de reservas, ocupación y operación para darte recomendaciones personalizadas. <strong>La IA no ejecuta acciones automáticamente</strong>, todas las sugerencias requieren tu aprobación.</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {suggestions.filter(s => s.status === 'new').length > 0 && <h2 className="text-xl font-semibold">Nuevas sugerencias</h2>}
                    {suggestions.filter(s => s.status === 'new').map((suggestion, index) => (
                        <motion.div key={suggestion.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                            className={cn('bg-card rounded-xl p-6 shadow-card border-l-4', suggestion.priority === 'high' ? 'border-l-destructive' : suggestion.priority === 'medium' ? 'border-l-warning' : 'border-l-muted')}>
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">{getCategoryIcon(suggestion.category)}</div>
                                        <div><h3 className="font-semibold text-lg">{suggestion.title}</h3>{getPriorityBadge(suggestion.priority)}</div>
                                    </div>
                                    <p className="text-muted-foreground mb-4">{suggestion.description}</p>
                                    <div className="flex items-center gap-4 text-sm">
                                        <div><span className="text-muted-foreground">Impacto: </span><span className="font-medium">{suggestion.impact}</span></div>
                                        <div className="flex items-center gap-2"><span className="text-muted-foreground">Confianza:</span><Progress value={suggestion.confidence} className="w-20 h-2" /><span className="font-medium">{suggestion.confidence}%</span></div>
                                    </div>
                                </div>
                                <div className="flex md:flex-col gap-2">
                                    <Button className="gap-2"><Check className="w-4 h-4" />Aplicar</Button>
                                    <Button variant="outline">Descartar</Button>
                                    <Button variant="ghost" size="sm"><ChevronRight className="w-4 h-4" /></Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {suggestions.filter(s => s.status !== 'new').length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-muted-foreground">Sugerencias anteriores</h2>
                        {suggestions.filter(s => s.status !== 'new').map(suggestion => (
                            <div key={suggestion.id} className="bg-card/50 rounded-xl p-4 opacity-60">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3"><div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">{getCategoryIcon(suggestion.category)}</div><span className="font-medium">{suggestion.title}</span></div>
                                    {getStatusBadge(suggestion.status)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AISuggestionsPage;
