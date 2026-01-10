import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, ThumbsUp, ThumbsDown, Filter, TrendingUp, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/admin/AdminLayout';

const mockReviews = [
    { id: 1, customer: 'María García', rating: 5, comment: 'Excelente comida y servicio. El ambiente es increíble, volveré pronto.', date: '2024-02-14', responded: true, helpful: 12 },
    { id: 2, customer: 'Carlos López', rating: 4, comment: 'Muy buena experiencia, aunque el tiempo de espera fue un poco largo.', date: '2024-02-13', responded: false, helpful: 5 },
    { id: 3, customer: 'Ana Martínez', rating: 5, comment: 'La cochinita pibil es la mejor que he probado. Personal muy amable.', date: '2024-02-12', responded: true, helpful: 8 },
    { id: 4, customer: 'Roberto Sánchez', rating: 3, comment: 'La comida estaba bien, pero esperaba más por el precio.', date: '2024-02-11', responded: false, helpful: 2 },
    { id: 5, customer: 'Laura Torres', rating: 5, comment: 'Celebramos nuestro aniversario aquí. ¡Perfecto!', date: '2024-02-10', responded: true, helpful: 15 },
];

const ratingDistribution = [
    { stars: 5, count: 156, percentage: 65 },
    { stars: 4, count: 52, percentage: 22 },
    { stars: 3, count: 18, percentage: 8 },
    { stars: 2, count: 8, percentage: 3 },
    { stars: 1, count: 6, percentage: 2 },
];

const ReviewsPage = () => {
    const [filter, setFilter] = useState('all');
    const averageRating = 4.5;
    const totalReviews = 240;

    const renderStars = (rating: number) => (
        <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map(star => <Star key={star} className={`w-4 h-4 ${star <= rating ? 'fill-warning text-warning' : 'text-muted-foreground/30'}`} />)}</div>
    );

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div><h1 className="text-3xl font-display font-bold">Opiniones</h1><p className="text-muted-foreground">{totalReviews} opiniones en total</p></div>
                    <Select value={filter} onValueChange={setFilter}><SelectTrigger className="w-40"><Filter className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas</SelectItem><SelectItem value="positive">Positivas (4-5⭐)</SelectItem><SelectItem value="negative">Negativas (1-3⭐)</SelectItem><SelectItem value="pending">Sin responder</SelectItem></SelectContent></Select>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-card rounded-xl p-6 shadow-card text-center">
                        <div className="flex items-center justify-center gap-3 mb-4"><Award className="w-8 h-8 text-warning" /><span className="text-5xl font-bold">{averageRating}</span></div>
                        {renderStars(Math.round(averageRating))}
                        <p className="text-muted-foreground mt-2">{totalReviews} opiniones</p>
                    </div>
                    <div className="md:col-span-2 bg-card rounded-xl p-6 shadow-card">
                        <h3 className="font-semibold mb-4">Distribución de calificaciones</h3>
                        <div className="space-y-3">
                            {ratingDistribution.map(item => (
                                <div key={item.stars} className="flex items-center gap-3">
                                    <span className="w-16 text-sm flex items-center gap-1">{item.stars}<Star className="w-3 h-3 fill-warning text-warning" /></span>
                                    <Progress value={item.percentage} className="flex-1 h-3" />
                                    <span className="w-12 text-sm text-right text-muted-foreground">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-xl shadow-card overflow-hidden">
                    <div className="p-4 border-b flex items-center justify-between"><h3 className="font-semibold">Opiniones recientes</h3><Badge variant="outline">{mockReviews.filter(r => !r.responded).length} sin responder</Badge></div>
                    <div className="divide-y">
                        {mockReviews.map(review => (
                            <motion.div key={review.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 hover:bg-muted/30">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-semibold">{review.customer}</p>
                                        <p className="text-sm text-muted-foreground">{review.date}</p>
                                    </div>
                                    <div className="flex items-center gap-2">{renderStars(review.rating)}<Badge className={review.responded ? 'bg-success' : 'bg-warning'}>{review.responded ? 'Respondida' : 'Pendiente'}</Badge></div>
                                </div>
                                <p className="text-muted-foreground mb-3">{review.comment}</p>
                                <div className="flex gap-2">
                                    {!review.responded && <Button size="sm"><MessageSquare className="w-4 h-4 mr-1" />Responder</Button>}
                                    <Button variant="ghost" size="sm"><ThumbsUp className="w-4 h-4 mr-1" />{review.helpful}</Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ReviewsPage;
