import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.SMTP_FROM_EMAIL || SMTP_USER;

const transporter = SMTP_USER && SMTP_PASS && SMTP_PASS !== '' && SMTP_PASS !== 'mock'
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
  : null;

export async function sendOtpEmail(email: string, otp: string, purpose: string): Promise<boolean> {
  const purposeText = purpose === 'register' ? 'verify your DocClustor account' : 'complete your secure login';
  
  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb; padding: 40px 20px; text-align: center;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border: 1px solid #f1f5f9; text-align: left;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #0B76FF; font-size: 28px; font-weight: 700; margin: 0;">DocClustor</h1>
          <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0 0;">Secure Document RAG System</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin-bottom: 24px;" />
        <p style="color: #374151; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
          Hello,
        </p>
        <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
          Please use the following One-Time Password (OTP) to ${purposeText}. This code is valid for 10 minutes.
        </p>
        <div style="text-align: center; background-color: #f3f4f6; border-radius: 8px; padding: 18px; margin-bottom: 24px; border: 1px dashed #cbd5e1;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #111827;">${otp}</span>
        </div>
        <p style="color: #4b5563; font-size: 14px; line-height: 20px; margin-bottom: 24px;">
          If you did not request this, please disregard this email. Your account security remains intact.
        </p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin-bottom: 24px;" />
        <p style="color: #9ca3af; font-size: 12px; line-height: 18px; text-align: center; margin: 0;">
          © 2026 DocClustor. All rights reserved.
        </p>
      </div>
    </div>
  `;

  if (!transporter) {
    console.warn(`[Mock OTP System] SMTP credentials not set. Logging OTP for ${email}: ${otp}`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: `"DocClustor" <${FROM_EMAIL}>`,
      to: email,
      subject: `DocClustor - Verification Code: ${otp}`,
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error('Failed to send email via SMTP:', error);
    throw error;
  }
}
