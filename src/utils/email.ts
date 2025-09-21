import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASS },
});

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${env.APP_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    to: email,
    subject: 'تأیید ایمیل',
    html: `<p>برای تأیید، <a href="${url}">اینجا کلیک کنید</a></p>`,
  });
}