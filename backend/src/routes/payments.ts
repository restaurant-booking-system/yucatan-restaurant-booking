import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { supabaseAdmin } from '../config/supabase.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Initialize Stripe with secret key 
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
});

/**
 * POST /api/payments/create-intent
 * Create a PaymentIntent for reservation deposit
 */
router.post('/create-intent', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { amount, currency = 'mxn', reservationData } = req.body;
        const userId = (req as any).user?.id;

        if (!amount || amount <= 0) {
            res.status(400).json({
                success: false,
                error: 'Amount is required and must be greater than 0',
            });
            return;
        }

        // Create PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects cents/centavos
            currency,
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                userId,
                restaurantId: reservationData?.restaurantId || '',
                date: reservationData?.date || '',
                time: reservationData?.time || '',
                guestCount: reservationData?.guestCount?.toString() || '',
            },
        });

        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            amount,
        });
    } catch (error: any) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error creating payment intent',
        });
    }
});

/**
 * POST /api/payments/confirm
 * Confirm payment was successful and update reservation
 */
router.post('/confirm', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { paymentIntentId, reservationId } = req.body;

        // Verify payment with Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            res.status(400).json({
                success: false,
                error: 'Payment not completed',
            });
            return;
        }

        // Update reservation with deposit_paid = true
        if (reservationId) {
            const { error } = await supabaseAdmin
                .from('reservations')
                .update({
                    deposit_paid: true,
                    deposit_paid_at: new Date().toISOString(),
                    deposit_amount: paymentIntent.amount / 100,
                })
                .eq('id', reservationId);

            if (error) {
                console.error('Error updating reservation:', error);
            }
        }

        res.json({
            success: true,
            message: 'Payment confirmed',
            paymentIntent: {
                id: paymentIntent.id,
                status: paymentIntent.status,
                amount: paymentIntent.amount / 100,
            },
        });
    } catch (error: any) {
        console.error('Error confirming payment:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error confirming payment',
        });
    }
});

/**
 * POST /api/payments/webhook
 * Stripe webhook for payment events (optional, for production)
 */
router.post('/webhook', async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    try {
        let event;

        if (webhookSecret && sig) {
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } else {
            event = req.body;
        }

        // Handle the event
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                console.log(`💰 Payment succeeded: ${paymentIntent.id}`);
                break;
            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                console.log(`❌ Payment failed: ${failedPayment.id}`);
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (error: any) {
        console.error('Webhook error:', error);
        res.status(400).json({ error: error.message });
    }
});

export default router;
