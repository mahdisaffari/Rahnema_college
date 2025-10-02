import nodemailer from 'nodemailer';
import { env } from '../config/env';
import retry from 'retry';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
  pool: true,
  maxConnections: 1,
  maxMessages: 3,
  connectionTimeout: 10000,
});

function sendMailWithRetry(
  mailOptions: nodemailer.SendMailOptions, 
  retries = 3
): Promise<nodemailer.SentMessageInfo> {  
  const operation = retry.operation({
    retries,
    factor: 2,
    minTimeout: 1000,
    maxTimeout: 5000,
  });

  return new Promise((resolve, reject) => {
    operation.attempt(async () => {
      try {
        const info = await transporter.sendMail(mailOptions);
        resolve(info);
      } catch (err) {
        if (operation.retry(err as Error)) return;
        reject(err);
      }
    });
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${env.APP_URL}/verify-email?token=${token}`;
  await sendMailWithRetry({
    from: `"CodeChefs" <${env.EMAIL_USER}>`,
    to: email,
    subject: 'تأیید ایمیل',
    html: `<p>برای تأیید، <a href="${url}">اینجا کلیک کنید</a></p>`,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${env.APP_URL}/reset-password?token=${token}`;
  await sendMailWithRetry({
    from: `"CodeChefs" <${env.EMAIL_USER}>`,
    to: email,
    subject: 'بازنشانی رمز عبور',
    html: `<p>برای بازنشانی، <a href="${url}">اینجا کلیک کنید</a>. این لینک ۱ ساعت معتبره.</p>`,
  });
}