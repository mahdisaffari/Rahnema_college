import nodemailer from 'nodemailer';
import { env } from '../config/env';
import retry from 'retry';
import { google } from 'googleapis';

const OAuth2 = google.auth.OAuth2;

async function createTransporter() {
  const oauth2Client = new OAuth2(
    env.CLIENT_ID,
    env.CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({
    refresh_token: env.REFRESH_TOKEN,
  });

  const accessTokenObj = await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err: any, token: any) => {
      if (err) reject(err);
      resolve(token);
    });
  });

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: env.EMAIL_USER,
      clientId: env.CLIENT_ID,
      clientSecret: env.CLIENT_SECRET,
      refreshToken: env.REFRESH_TOKEN,
      accessToken: accessTokenObj as string,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    logger: true,
    debug: env.NODE_ENV !== 'production',
  });
}

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
        const transporter = await createTransporter();
        const info = await transporter.sendMail(mailOptions);
        resolve(info);
      } catch (err) {
        if (operation.retry(err as Error)) return;
        reject(operation.mainError());
      }
    });
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${env.APP_URL}/verify-email?token=${token}`;
  await sendMailWithRetry({
    to: email,
    subject: 'تأیید ایمیل',
    html: `<p>برای تأیید، <a href="${url}">اینجا کلیک کنید</a></p>`,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${env.APP_URL}/reset-password?token=${token}`;
  await sendMailWithRetry({
    to: email,
    subject: 'بازنشانی رمز عبور',
    html: `<p>برای بازنشانی رمز عبور، <a href="${url}">اینجا کلیک کنید</a>. این لینک پس از ۱ ساعت منقضی می‌شود.</p>`,
  });
}