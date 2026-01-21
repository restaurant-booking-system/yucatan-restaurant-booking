import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { reviewService } from '@/services/api';
import { toast } from 'sonner';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    reservation: {
        id: string;
        restaurantId: string;
        restaurantName: string;
        date: string;
    };
    onSubmitted: () => void;
}

const ReviewModal = ({ isOpen, onClose, reservation, onSubmitted }: ReviewModalProps) => {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error('Por favor selecciona una calificación');
            return;
        }

        setIsSubmitting(true);
        try {
            await reviewService.create({
                restaurantId: reservation.restaurantId,
                userId: '', // Will be filled by backend from auth
                rating,
                comment: comment.trim() || undefined,
            } as any);

            toast.success('¡Gracias por tu opinión!');
            onSubmitted();
            onClose();
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error('Error al enviar tu opinión. Intenta de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkip = () => {
        onSubmitted();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center">
                    <DialogTitle className="text-2xl font-display">
                        ¿Cómo fue tu experiencia?
                    </DialogTitle>
                    <DialogDescription className="text-base">
                        Tu visita a <span className="font-semibold text-foreground">{reservation.restaurantName}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-6">
                    {/* Star Rating */}
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <motion.button
                                key={star}
                                type="button"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="focus:outline-none"
                            >
                                <Star
                                    className={`w-10 h-10 transition-colors ${star <= (hoveredRating || rating)
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-muted-foreground/30'
                                        }`}
                                />
                            </motion.button>
                        ))}
                    </div>

                    {/* Rating Label */}
                    <AnimatePresence mode="wait">
                        {rating > 0 && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-center text-sm font-medium text-muted-foreground"
                            >
                                {rating === 1 && 'Muy malo 😞'}
                                {rating === 2 && 'Malo 😕'}
                                {rating === 3 && 'Regular 😐'}
                                {rating === 4 && 'Bueno 😊'}
                                {rating === 5 && '¡Excelente! 🤩'}
                            </motion.p>
                        )}
                    </AnimatePresence>

                    {/* Comment */}
                    <div className="space-y-2">
                        <Textarea
                            placeholder="Cuéntanos más sobre tu experiencia (opcional)"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="min-h-[100px] resize-none"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button
                        variant="ghost"
                        onClick={handleSkip}
                        disabled={isSubmitting}
                        className="flex-1"
                    >
                        Omitir
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || rating === 0}
                        className="flex-1 gap-2"
                    >
                        {isSubmitting ? (
                            <>Enviando...</>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Enviar Opinión
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ReviewModal;
