import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

/**
 * Create email transporter using Nuxt runtime config
 */
const createTransporter = (): Transporter => {
  const config = useRuntimeConfig();

  const port = parseInt(config.mailPort);
  const isSecure = config.mailSecure === "true";

  // Port 465 uses SSL (secure: true)
  // Port 587 uses STARTTLS (secure: false, requireTLS: true)
  const transportConfig: any = {
    host: config.mailHost,
    port: port,
    secure: isSecure, // true for 465, false for other ports
    auth: {
      user: config.mailUsername,
      pass: config.mailPassword,
    },
  };

  // If not using secure (SSL), enable STARTTLS for port 587
  if (!isSecure && port === 587) {
    transportConfig.requireTLS = true;
    transportConfig.tls = {
      ciphers: "SSLv3",
      rejectUnauthorized: false, // Set to true in production with valid certificates
    };
  }

  return nodemailer.createTransport(transportConfig);
};

/**
 * Get app configuration
 */
const getAppConfig = () => {
  const config = useRuntimeConfig();
  return {
    appName: process.env.APP_NAME || "DLAS Smart Tour",
    appUrl: process.env.APP_URL || "http://localhost:3000",
    fromEmail: config.mailFromAddress,
    fromName: config.mailFromName,
  };
};

/**
 * Email templates
 */
const generateEmailVerificationTemplate = (
  userName: string,
  verificationLink: string,
): string => {
  const { appName } = getAppConfig();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #f9f9f9;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 2px solid #4CAF50;
        }
        .header h1 {
          color: #4CAF50;
          margin: 0;
        }
        .content {
          padding: 30px 0;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #4CAF50;
          color: white !important;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          margin: 20px 0;
        }
        .button:hover {
          background-color: #45a049;
        }
        .footer {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #666;
        }
        .warning {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 10px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎫 ${appName}</h1>
        </div>
        <div class="content">
          <h2>Hi ${userName}! 👋</h2>
          <p>Thank you for signing up! We're excited to have you on board.</p>
          <p>Please verify your email address by clicking the button below:</p>
          <div style="text-align: center;">
            <a href="${verificationLink}" class="button">Verify Email Address</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666; font-size: 14px;">
            ${verificationLink}
          </p>
          <div class="warning">
            <strong>⚠️ Note:</strong> This verification link will expire in <strong>1 hour</strong>.
          </div>
          <p>If you didn't create an account with us, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generatePasswordResetTemplate = (
  userName: string,
  resetLink: string,
): string => {
  const { appName } = getAppConfig();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #f9f9f9;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 2px solid #ff9800;
        }
        .header h1 {
          color: #ff9800;
          margin: 0;
        }
        .content {
          padding: 30px 0;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #ff9800;
          color: white !important;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          margin: 20px 0;
        }
        .button:hover {
          background-color: #e68900;
        }
        .footer {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #666;
        }
        .warning {
          background-color: #ffebee;
          border-left: 4px solid #f44336;
          padding: 10px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 ${appName}</h1>
        </div>
        <div class="content">
          <h2>Hi ${userName}! 👋</h2>
          <p>We received a request to reset your password.</p>
          <p>Click the button below to create a new password:</p>
          <div style="text-align: center;">
            <a href="${resetLink}" class="button">Reset Password</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666; font-size: 14px;">
            ${resetLink}
          </p>
          <div class="warning">
            <strong>⚠️ Security Notice:</strong> This password reset link will expire in <strong>1 hour</strong>.
          </div>
          <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateWelcomeTemplate = (userName: string): string => {
  const { appName, appUrl } = getAppConfig();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to ${appName}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #f9f9f9;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 2px solid #2196F3;
        }
        .header h1 {
          color: #2196F3;
          margin: 0;
        }
        .content {
          padding: 30px 0;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #2196F3;
          color: white !important;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          margin: 20px 0;
        }
        .button:hover {
          background-color: #0b7dda;
        }
        .footer {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #666;
        }
        .features {
          background-color: white;
          padding: 20px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .features ul {
          list-style: none;
          padding: 0;
        }
        .features li {
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .features li:last-child {
          border-bottom: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 ${appName}</h1>
        </div>
        <div class="content">
          <h2>Welcome, ${userName}! 🎊</h2>
          <p>Your email has been verified successfully! You're now ready to explore amazing attractions.</p>
          <div class="features">
            <h3>What you can do now:</h3>
            <ul>
              <li>✅ Browse available attractions</li>
              <li>✅ Purchase tickets</li>
              <li>✅ Manage your bookings</li>
              <li>✅ View your ticket history</li>
            </ul>
          </div>
          <div style="text-align: center;">
            <a href="${appUrl}" class="button">Start Exploring</a>
          </div>
          <p>If you have any questions, feel free to reach out to our support team.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Email Service Functions
 */
export const sendVerificationEmail = async (
  email: string,
  userName: string,
  token: string,
): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    const { appName, appUrl, fromEmail, fromName } = getAppConfig();
    const verificationLink = `${appUrl}/auth/verify-email?token=${token}`;

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: `Verify Your Email - ${appName}`,
      html: generateEmailVerificationTemplate(userName, verificationLink),
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    return false;
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  userName: string,
  token: string,
): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    const { appName, appUrl, fromEmail, fromName } = getAppConfig();
    const resetLink = `${appUrl}/auth/reset-password?token=${token}`;

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: `Reset Your Password - ${appName}`,
      html: generatePasswordResetTemplate(userName, resetLink),
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    return false;
  }
};

export const sendWelcomeEmail = async (
  email: string,
  userName: string,
): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    const { appName, fromEmail, fromName } = getAppConfig();

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: `Welcome to ${appName}! 🎉`,
      html: generateWelcomeTemplate(userName),
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    return false;
  }
};

const generateReviewReminderTemplate = (userName: string, reviewLink: string): string => {
  const { appName } = getAppConfig();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>How was your experience?</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #f9f9f9;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 2px solid #9C27B0;
        }
        .header h1 {
          color: #9C27B0;
          margin: 0;
        }
        .content {
          padding: 30px 0;
          text-align: center;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #9C27B0;
          color: white !important;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          margin: 20px 0;
        }
        .button:hover {
          background-color: #7B1FA2;
        }
        .stars {
          font-size: 24px;
          color: #FFC107;
          margin: 10px 0;
        }
        .footer {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⭐ ${appName}</h1>
        </div>
        <div class="content">
          <h2>Hi ${userName},</h2>
          <p>We hope you enjoyed your recent visit!</p>
          <p>We would love to hear about your experience. Your feedback helps us improve and helps others choose their next adventure.</p>
          
          <div class="stars">★★★★★</div>
          
          <p>It only takes a minute:</p>
          <div style="text-align: center;">
            <a href="${reviewLink}" class="button">Write a Review</a>
          </div>
          
          <p>If the button doesn't work, copy this link:</p>
          <p style="word-break: break-all; color: #666; font-size: 14px;">
            ${reviewLink}
          </p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const sendReviewReminderEmail = async (
  email: string,
  userName: string,
  token: string,
): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    const { appName, appUrl, fromEmail, fromName } = getAppConfig();
    const reviewLink = `${appUrl}/testimonials/submit?token=${token}`;

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: `How was your visit to ${appName}?`,
      html: generateReviewReminderTemplate(userName, reviewLink),
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Failed to send review reminder:", error);
    return false;
  }
};

/**
 * Test email configuration
 */
export const testEmailConnection = async (): Promise<boolean> => {
  try {
    const config = useRuntimeConfig();
    console.log("🔍 Testing email connection...");
    console.log("📧 Email Configuration:");
    console.log(`   Host: ${config.mailHost}`);
    console.log(`   Port: ${config.mailPort}`);
    console.log(`   Secure: ${config.mailSecure}`);
    console.log(`   Username: ${config.mailUsername}`);
    console.log(`   From: ${config.mailFromAddress}`);

    const transporter = createTransporter();
    await transporter.verify();
    console.log("✅ Email service is ready and authenticated");
    return true;
  } catch (error: any) {
    console.error("❌ Email service connection failed");
    console.error("Error details:", error.message);

    if (error.code === "ESOCKET") {
      console.error("💡 Tip: Check if SMTP host and port are correct");
    } else if (error.code === "EAUTH") {
      console.error("💡 Tip: Check username and password");
      console.error("💡 For Gmail: Use App Password, not regular password");
    } else if (error.message.includes("wrong version number")) {
      console.error("💡 Tip: Port/Secure mismatch detected");
      console.error('   - Port 587 → MAIL_SECURE="false" (STARTTLS)');
      console.error('   - Port 465 → MAIL_SECURE="true" (SSL)');
    }

    return false;
  }
};
