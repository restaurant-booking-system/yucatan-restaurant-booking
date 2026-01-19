import { Router, Request, Response } from 'express';
import { sendVerificationCode } from '../services/email.js';

const router = Router();

// In-memory store for verification codes (consider Redis for production)
const verificationCodes = new Map<string, { code: string; expires: Date; attempts: number }>();

/**
 * POST /api/verification/send-code
 * Send a verification code to the provided email
 */
router.post('/send-code', async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Store code with 10-minute expiration
        verificationCodes.set(email.toLowerCase(), {
            code,
            expires: new Date(Date.now() + 10 * 60 * 1000),
            attempts: 0
        });

        console.log(`📧 Verification code for ${email}: ${code}`);
        console.log(`📧 Attempting to send email via Gmail...`);

        // Send real email using Gmail
        const emailSent = await sendVerificationCode({ to: email, code });

        if (emailSent) {
            console.log(`✅ Email sent successfully to ${email}`);
            res.json({
                success: true,
                message: 'Código de verificación enviado a tu correo'
            });
        } else {
            console.error(`❌ Failed to send email to ${email}`);
            res.status(500).json({
                success: false,
                error: 'No se pudo enviar el correo. Verifica que el email sea válido.'
            });
        }

    } catch (error) {
        console.error('Error sending verification code:', error);
        res.status(500).json({
            success: false,
            error: 'Error al enviar el código de verificación'
        });
    }
});

/**
 * POST /api/verification/verify-code
 * Verify the code entered by the user
 */
router.post('/verify-code', async (req: Request, res: Response) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({
                success: false,
                error: 'Email y código son requeridos'
            });
        }

        const stored = verificationCodes.get(email.toLowerCase());

        if (!stored) {
            return res.status(400).json({
                success: false,
                error: 'No se encontró código de verificación. Solicita uno nuevo.'
            });
        }

        // Check if expired
        if (stored.expires < new Date()) {
            verificationCodes.delete(email.toLowerCase());
            return res.status(400).json({
                success: false,
                error: 'El código ha expirado. Solicita uno nuevo.'
            });
        }

        // Check attempts (max 5)
        if (stored.attempts >= 5) {
            verificationCodes.delete(email.toLowerCase());
            return res.status(400).json({
                success: false,
                error: 'Demasiados intentos. Solicita un nuevo código.'
            });
        }

        // Verify code
        if (stored.code !== code) {
            stored.attempts++;
            return res.status(400).json({
                success: false,
                error: 'Código incorrecto',
                attemptsRemaining: 5 - stored.attempts
            });
        }

        // Success - delete the code
        verificationCodes.delete(email.toLowerCase());

        res.json({
            success: true,
            verified: true,
            message: 'Correo verificado correctamente'
        });

    } catch (error) {
        console.error('Error verifying code:', error);
        res.status(500).json({
            success: false,
            error: 'Error al verificar el código'
        });
    }
});

/**
 * POST /api/verification/resend-code
 * Resend verification code
 */
router.post('/resend-code', async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }

        // Generate new 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Store code with 10-minute expiration
        verificationCodes.set(email.toLowerCase(), {
            code,
            expires: new Date(Date.now() + 10 * 60 * 1000),
            attempts: 0
        });

        console.log(`📧 Resent verification code for ${email}: ${code}`);

        // Send real email using Resend
        const emailSent = await sendVerificationCode({ to: email, code });

        res.json({
            success: true,
            message: emailSent ? 'Nuevo código enviado a tu correo' : 'Código generado',
            devCode: code
        });

    } catch (error) {
        console.error('Error resending verification code:', error);
        res.status(500).json({
            success: false,
            error: 'Error al reenviar el código'
        });
    }
});

export default router;
