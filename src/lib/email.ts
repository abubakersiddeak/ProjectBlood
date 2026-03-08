// lib/email.ts
import nodemailer from "nodemailer";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || "Blood Donation"}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
}

// Email templates
export const getPasswordResetEmailTemplate = (
  userName: string,
  resetLink: string,
) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body {
          font-family: Arial, sans-serif;
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
          border: 1px solid #e0e0e0;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 32px;
          color: #dc2626;
          font-weight: bold;
        }
        .content {
          background-color: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
          color: #dc2626;
          margin-top: 0;
        }
        .button {
          display: inline-block;
          padding: 14px 30px;
          background-color: #dc2626;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .button:hover {
          background-color: #b91c1c;
        }
        .warning {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          color: #666;
          font-size: 14px;
        }
        .expiry {
          color: #dc2626;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🩸 Blood Donation</div>
        </div>
        <div class="content">
          <h1>Reset Your Password</h1>
          <p>Hello <strong>${userName}</strong>,</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          
          <div style="text-align: center;">
            <a href="${resetLink}" class="button">Reset Password</a>
          </div>
          
          <div class="warning">
            <strong>⚠️ Important:</strong> This link will expire in <span class="expiry">1 hour</span> for security reasons.
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="background-color: #f3f4f6; padding: 10px; border-radius: 4px; word-break: break-all;">
            ${resetLink}
          </p>
          
          <p style="margin-top: 30px;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        </div>
        <div class="footer">
          <p>This is an automated email, please do not reply.</p>
          <p>&copy; ${new Date().getFullYear()} Blood Donation Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const getPasswordResetSuccessTemplate = (userName: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Successful</title>
      <style>
        body {
          font-family: Arial, sans-serif;
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
          border: 1px solid #e0e0e0;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 32px;
          color: #dc2626;
          font-weight: bold;
        }
        .content {
          background-color: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .success-icon {
          text-align: center;
          font-size: 48px;
          margin: 20px 0;
        }
        h1 {
          color: #16a34a;
          margin-top: 0;
          text-align: center;
        }
        .info-box {
          background-color: #dbeafe;
          border-left: 4px solid #3b82f6;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🩸 Blood Donation</div>
        </div>
        <div class="content">
          <div class="success-icon">✅</div>
          <h1>Password Reset Successful!</h1>
          <p>Hello <strong>${userName}</strong>,</p>
          <p>Your password has been successfully reset. You can now log in with your new password.</p>
          
          <div class="info-box">
            <strong>🔒 Security Reminder:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Never share your password with anyone</li>
              <li>Use a strong, unique password</li>
              <li>Enable two-factor authentication if available</li>
            </ul>
          </div>
          
          <p>If you didn't make this change, please contact our support team immediately.</p>
        </div>
        <div class="footer">
          <p>This is an automated email, please do not reply.</p>
          <p>&copy; ${new Date().getFullYear()} Blood Donation Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
