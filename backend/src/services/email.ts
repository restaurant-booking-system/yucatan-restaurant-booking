import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendVerificationCodeOptions {
    to: string;
    code: string;
}

export async function sendVerificationCode({ to, code }: SendVerificationCodeOptions): Promise<boolean> {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Mesa Feliz <onboarding@resend.dev>', // Use Resend's test domain
            to: [to],
            subject: '🔐 Código de verificación - Mesa Feliz',
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1a5a3e 0%, #2d8a5e 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🍽️ Mesa Feliz</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">
                Sistema de Reservaciones
            </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 22px; text-align: center;">
                Verifica tu correo electrónico
            </h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; text-align: center;">
                Usa el siguiente código para verificar tu cuenta:
            </p>
            
            <!-- Code Box -->
            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0; border: 2px dashed #1a5a3e;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1a5a3e; font-family: 'Courier New', monospace;">
                    ${code}
                </span>
            </div>
            
            <p style="color: #999; font-size: 14px; text-align: center; margin: 20px 0 0 0;">
                ⏰ Este código expira en <strong>10 minutos</strong>
            </p>
            
            <p style="color: #999; font-size: 13px; text-align: center; margin: 25px 0 0 0; padding-top: 20px; border-top: 1px solid #eee;">
                Si no solicitaste este código, puedes ignorar este correo.
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">
                © 2024 Mesa Feliz - Todos los derechos reservados
            </p>
        </div>
    </div>
</body>
</html>
            `,
        });

        if (error) {
            console.error('Error sending email:', error);
            return false;
        }

        console.log('✅ Email sent successfully:', data?.id);
        return true;
    } catch (error) {
        console.error('Error sending verification email:', error);
        return false;
    }
}

export async function sendWelcomeEmail(to: string, restaurantName: string): Promise<boolean> {
    try {
        const { error } = await resend.emails.send({
            from: 'Mesa Feliz <onboarding@resend.dev>',
            to: [to],
            subject: `🎉 ¡Bienvenido a Mesa Feliz, ${restaurantName}!`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1a5a3e 0%, #2d8a5e 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0;">🍽️ Mesa Feliz</h1>
        </div>
        <div style="padding: 40px 30px; text-align: center;">
            <h2 style="color: #333;">¡Bienvenido, ${restaurantName}!</h2>
            <p style="color: #666;">Tu restaurante ha sido registrado exitosamente.</p>
            <p style="color: #666;">Ya puedes comenzar a recibir reservaciones.</p>
        </div>
    </div>
</body>
</html>
            `,
        });

        if (error) {
            console.error('Error sending welcome email:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return false;
    }
}
