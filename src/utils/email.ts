import nodemailer from 'nodemailer';
import { env } from '../config/env';
import retry from 'retry';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,  
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
  logger: true,
  debug: env.NODE_ENV !== 'production',
});

function sendMailWithRetry(mailOptions: nodemailer.SendMailOptions, retries = 3) {
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
        console.error('Send mail error:', err);
        if (operation.retry(err as Error)) return;
        reject(operation.mainError());
      }
    });
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${env.APP_URL}/verify-email?token=${token}`;
  try {
    await sendMailWithRetry({
      from: `"CodeChefs" <${env.EMAIL_USER}>`,
      to: email,
      subject: 'تأیید ایمیل',
      html: `<p>برای تأیید، <a href="${url}">اینجا کلیک کنید</a></p>`,
    });
    console.log(`Verification email sent to: ${email}`);
  } catch (err) {
    console.error('Verification email error:', err);
    throw new Error('خطا در ارسال ایمیل تأیید، لطفاً دوباره تلاش کنید');
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${env.APP_URL}/reset-password?token=${token}`;
  try {
    await sendMailWithRetry({
      from: `"CodeChefs" <${env.EMAIL_USER}>`,
      to: email,
      subject: 'بازنشانی رمز عبور',
      html: `<p>برای بازنشانی، <a href="${url}">اینجا کلیک کنید</a>. این لینک ۱ ساعت معتبره.</p>`,
    });
    console.log(`Reset email sent to: ${email}`);
  } catch (err) {
    console.error('Reset email error:', err);
    throw new Error('خطا در ارسال ایمیل بازنشانی، لطفاً دوباره تلاش کنید');
  }
}