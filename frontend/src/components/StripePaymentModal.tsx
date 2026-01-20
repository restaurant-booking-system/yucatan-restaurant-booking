import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { CreditCard, Lock, X, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface PaymentFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

const PaymentForm = ({ onSuccess, onCancel }: PaymentFormProps) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setError(null);

        const { error: submitError } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/mis-reservas`,
            },
            redirect: 'if_required',
        });

        if (submitError) {
            setError(submitError.message || 'Error processing payment');
            setIsProcessing(false);
        } else {
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-muted/50 rounded-xl p-4 border">
                <PaymentElement
                    options={{
                        layout: 'tabs',
                    }}
                />
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-destructive/10 rounded-xl border border-destructive/20 text-destructive text-sm"
                >
                    {error}
                </motion.div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span>Pago seguro procesado por Stripe</span>
            </div>

            <div className="flex gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isProcessing}
                    className="flex-1"
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    disabled={!stripe || isProcessing}
                    className="flex-1 btn-hero"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Procesando...
                        </>
                    ) : (
                        <>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Pagar
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
};

interface StripePaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    amount: number;
    restaurantName: string;
    reservationData: {
        restaurantId: string;
        date: string;
        time: string;
        guestCount: number;
    };
}

export const StripePaymentModal = ({
    isOpen,
    onClose,
    onSuccess,
    amount,
    restaurantName,
    reservationData,
}: StripePaymentModalProps) => {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    // Create PaymentIntent when modal opens
    const createPaymentIntent = async () => {
        setIsLoading(true);
        try {
            const session = localStorage.getItem('mesafeliz_restaurant_session');
            const token = session ? JSON.parse(session).token : null;

            const response = await fetch(`${API_BASE_URL}/payments/create-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                },
                body: JSON.stringify({
                    amount,
                    currency: 'mxn',
                    reservationData,
                }),
            });

            const data = await response.json();
            if (data.success) {
                setClientSecret(data.clientSecret);
            } else {
                console.error('Failed to create payment intent:', data.error);
            }
        } catch (error) {
            console.error('Error creating payment intent:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuccess = () => {
        setPaymentSuccess(true);
        setTimeout(() => {
            onSuccess();
        }, 2000);
    };

    // Reset state when modal closes
    const handleClose = () => {
        setClientSecret(null);
        setPaymentSuccess(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        Anticipo de Reserva
                    </DialogTitle>
                </DialogHeader>

                {paymentSuccess ? (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center py-8"
                    >
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
                            <CheckCircle className="h-10 w-10 text-success" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">¡Pago Exitoso!</h3>
                        <p className="text-muted-foreground">
                            Tu anticipo ha sido procesado correctamente.
                        </p>
                    </motion.div>
                ) : (
                    <>
                        {/* Amount Summary */}
                        <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-muted-foreground">Anticipo para</p>
                                    <p className="font-semibold">{restaurantName}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-primary">
                                        ${amount} <span className="text-sm font-normal">MXN</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {!clientSecret ? (
                            <div className="py-8 text-center">
                                {isLoading ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        <p className="text-muted-foreground">Preparando pago...</p>
                                    </div>
                                ) : (
                                    <Button onClick={createPaymentIntent} className="btn-hero">
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Continuar con el pago
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <Elements
                                stripe={stripePromise}
                                options={{
                                    clientSecret,
                                    appearance: {
                                        theme: 'stripe',
                                        variables: {
                                            colorPrimary: '#166534',
                                            borderRadius: '12px',
                                        },
                                    },
                                }}
                            >
                                <PaymentForm onSuccess={handleSuccess} onCancel={handleClose} />
                            </Elements>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default StripePaymentModal;
