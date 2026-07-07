import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter
let transporter: nodemailer.Transporter;

const initTransporter = async () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    // Standard configuration
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  } else {
    // Ethereal / Fallback configuration
    console.log('⚠️ Mail config missing. Creating temporary testing SMTP account via Ethereal...');
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`✉️ Mock SMTP configuration initialized. User: ${testAccount.user}`);
    } catch (error) {
      console.error('❌ Failed to create mock SMTP account, falling back to console logging.', error);
      // Create a dummy transporter
      transporter = {
        sendMail: async (mailOptions: any) => {
          console.log('\n=================== MOCK EMAIL SENT ===================');
          console.log(`To: ${mailOptions.to}`);
          console.log(`Subject: ${mailOptions.subject}`);
          console.log(`Body:\n${mailOptions.text}`);
          console.log('=======================================================\n');
          return { messageId: 'mock-id' };
        }
      } as any;
    }
  }

  return transporter;
};

// Send verification email
export const sendVerificationEmail = async (toEmail: string, name: string, token: string) => {
  const mailClient = await initTransporter();
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verificationLink = `${frontendUrl}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || 'no-reply@crushlink.com',
    to: toEmail,
    subject: 'Verify your CrushLink Account 💖',
    text: `Hi ${name},\n\nPlease verify your email by clicking the following link:\n${verificationLink}\n\nThank you!\nCrushLink Team`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 15px;">
          <img src="https://img.icons8.com/fluency/96/hearts.png" alt="CrushLink" style="width: 64px; height: 64px;" />
        </div>
        <h2 style="color: #FF4D8D; text-align: center; font-size: 24px; font-weight: bold; margin-top: 0;">Verify Your Email 💖</h2>
        <p style="font-size: 16px; color: #4a4a4a;">Hi ${name},</p>
        <p style="font-size: 16px; color: #4a4a4a; line-height: 1.5;">Welcome to CrushLink! We are excited to help you find out if your crush likes you back. Please confirm your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="background: linear-gradient(135deg, #FF4D8D, #9D4EDD); color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 10px rgba(255, 77, 141, 0.3);">Verify Email Address</a>
        </div>
        <p style="font-size: 12px; color: #999; text-align: center;">If the button doesn't work, copy and paste this link in your browser:<br/><a href="${verificationLink}" style="color: #9D4EDD;">${verificationLink}</a></p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">If you did not sign up for this account, please ignore this email.</p>
      </div>
    `,
  };

  try {
    const info = await mailClient.sendMail(mailOptions);
    if ('messageId' in info && info.messageId !== 'mock-id') {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) console.log(`✉️ Email verification URL: ${previewUrl}`);
    }
  } catch (error) {
    console.error('❌ Error sending verification email', error);
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (toEmail: string, name: string, token: string) => {
  const mailClient = await initTransporter();
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetLink = `${frontendUrl}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || 'no-reply@crushlink.com',
    to: toEmail,
    subject: 'Reset your CrushLink Password 🔒',
    text: `Hi ${name},\n\nYou requested a password reset. Reset your password by clicking this link:\n${resetLink}\n\nThis link is valid for 1 hour.\n\nCrushLink Team`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 15px;">
          <img src="https://img.icons8.com/fluency/96/lock.png" alt="Reset Password" style="width: 64px; height: 64px;" />
        </div>
        <h2 style="color: #9D4EDD; text-align: center; font-size: 24px; font-weight: bold; margin-top: 0;">Reset Your Password 🔒</h2>
        <p style="font-size: 16px; color: #4a4a4a;">Hi ${name},</p>
        <p style="font-size: 16px; color: #4a4a4a; line-height: 1.5;">You requested a password reset for your CrushLink account. Click the button below to specify a new password. This link is valid for 1 hour.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background: linear-gradient(135deg, #9D4EDD, #FF4D8D); color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 10px rgba(157, 78, 221, 0.3);">Reset Password</a>
        </div>
        <p style="font-size: 12px; color: #999; text-align: center;">If the button doesn't work, copy and paste this link in your browser:<br/><a href="${resetLink}" style="color: #9D4EDD;">${resetLink}</a></p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">If you did not request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  };

  try {
    const info = await mailClient.sendMail(mailOptions);
    if ('messageId' in info && info.messageId !== 'mock-id') {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) console.log(`✉️ Email password reset URL: ${previewUrl}`);
    }
  } catch (error) {
    console.error('❌ Error sending password reset email', error);
  }
};

// Send response notification email
export const sendResponseNotificationEmail = async (
  toEmail: string,
  senderName: string,
  senderAvatar: string | null,
  recipientAnswer: 'YES' | 'NO',
  originalMessage: string | null,
  _slug: string
) => {
  const mailClient = await initTransporter();
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const dashboardLink = `${frontendUrl}/dashboard`;

  const isYes = recipientAnswer === 'YES';
  const emoji = isYes ? '💖' : '💔';
  const headerColor = isYes ? '#FF4D8D' : '#6c757d';
  const responseText = isYes ? 'YES! They like you! 😍' : 'NO. They want to be friends. 🥺';

  const mailOptions = {
    from: process.env.SMTP_FROM || 'no-reply@crushlink.com',
    to: toEmail,
    subject: `New CrushLink Response: ${recipientAnswer}! ${emoji}`,
    text: `Hi ${senderName},\n\nSomeone responded to your CrushLink! \n\nAnswer: ${recipientAnswer}\nOriginal Message: "${originalMessage || 'No anonymous message'}"\n\nCheck your dashboard here:\n${dashboardLink}\n\nCrushLink Team`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 15px;">
          <img src="${isYes ? 'https://img.icons8.com/fluency/96/hearts.png' : 'https://img.icons8.com/fluency/96/broken-heart.png'}" alt="CrushLink" style="width: 64px; height: 64px;" />
        </div>
        <h2 style="color: ${headerColor}; text-align: center; font-size: 24px; font-weight: bold; margin-top: 0;">New CrushLink Response! ${emoji}</h2>
        
        <div style="margin-bottom: 20px; line-height: 44px; min-height: 44px;">
          <img src="${senderAvatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=crushlink'}" alt="${senderName}" style="width: 44px; height: 44px; border-radius: 50%; float: left; margin-right: 12px; border: 2px solid #f0f0f0; vertical-align: middle;" />
          <span style="font-size: 16px; color: #4a4a4a; font-weight: bold; vertical-align: middle; line-height: 44px;">Hi ${senderName},</span>
          <div style="clear: both;"></div>
        </div>

        <p style="font-size: 16px; color: #4a4a4a;">Someone just answered your CrushLink query!</p>
        
        <div style="background-color: #fcf8fa; border-left: 4px solid ${headerColor}; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="font-size: 18px; font-weight: bold; color: ${headerColor}; margin-top: 0;">Response: ${responseText}</p>
          <p style="font-style: italic; color: #666; font-size: 14px;">"${originalMessage || 'No anonymous message added'}"</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${dashboardLink}" style="background: linear-gradient(135deg, #FF4D8D, #9D4EDD); color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 10px rgba(255, 77, 141, 0.3);">Open Dashboard</a>
        </div>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">CrushLink - Spread Love & Find Out</p>
      </div>
    `,
  };

  try {
    const info = await mailClient.sendMail(mailOptions);
    if ('messageId' in info && info.messageId !== 'mock-id') {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) console.log(`✉️ Email response notification URL: ${previewUrl}`);
    }
  } catch (error) {
    console.error('❌ Error sending response notification email', error);
  }
};
