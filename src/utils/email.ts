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

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${env.APP_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    to: email,
    subject: 'بازنشانی رمز عبور',
    html: `<p>برای بازنشانی رمز عبور، <a href="${url}">اینجا کلیک کنید</a>. این لینک پس از ۱ ساعت منقضی می‌شود.</p>`,
  });
}
