import createEmailTransporter from '../config/emailConfig.js';

class EmailService {
  constructor() {
    this.transporter = createEmailTransporter();
  }

  // Generate 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP email
  async sendOTPEmail(to, otp, fullName) {
    try {
      const mailOptions = {
        from: {
          name: 'GoRefurbish',
          address: process.env.EMAIL_USER
        },
        to: to,
        subject: 'Password Reset OTP - GoRefurbish',
        html: this.getOTPEmailTemplate(otp, fullName)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('OTP email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending OTP email:', error);
      return { success: false, error: error.message };
    }
  }

  // Email template for OTP
  getOTPEmailTemplate(otp, fullName) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset OTP</title>
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
                padding: 30px;
                border-radius: 10px;
                border: 1px solid #ddd;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #2c3e50;
                margin-bottom: 10px;
            }
            .otp-box {
                background-color: #3498db;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 8px;
                margin: 20px 0;
            }
            .otp-code {
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 5px;
                margin: 10px 0;
            }
            .warning {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
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
                <div class="logo">GoRefurbish</div>
                <h2>Password Reset Request</h2>
            </div>
            
            <p>Hello ${fullName || 'User'},</p>
            
            <p>We received a request to reset your password for your GoRefurbish account. Use the OTP code below to proceed with your password reset:</p>
            
            <div class="otp-box">
                <div>Your OTP Code:</div>
                <div class="otp-code">${otp}</div>
            </div>
            
            <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul>
                    <li>This OTP is valid for <strong>10 minutes</strong> only</li>
                    <li>Do not share this code with anyone</li>
                    <li>If you didn't request this, please ignore this email</li>
                </ul>
            </div>
            
            <p>If you didn't request a password reset, please ignore this email or contact our support team if you have concerns.</p>
            
            <div class="footer">
                <p>Best regards,<br>The GoRefurbish Team</p>
                <p><small>This is an automated email. Please do not reply to this message.</small></p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Send welcome email
  async sendWelcomeEmail(to, fullName) {
    try {
      const mailOptions = {
        from: {
          name: 'GoRefurbish',
          address: process.env.EMAIL_USER
        },
        to: to,
        subject: 'Welcome to GoRefurbish!',
        html: this.getWelcomeEmailTemplate(fullName)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  // Welcome email template
  getWelcomeEmailTemplate(fullName) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to GoRefurbish</title>
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
                padding: 30px;
                border-radius: 10px;
                border: 1px solid #ddd;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #27ae60;
                margin-bottom: 10px;
            }
            .welcome-box {
                background-color: #27ae60;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 8px;
                margin: 20px 0;
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
                <div class="logo">GoRefurbish</div>
                <h2>Welcome to Our Platform!</h2>
            </div>
            
            <div class="welcome-box">
                <h3>🎉 Account Created Successfully!</h3>
            </div>
            
            <p>Hello ${fullName},</p>
            
            <p>Welcome to GoRefurbish! Your account has been created successfully and you're now part of our community.</p>
            
            <p>You can now:</p>
            <ul>
                <li>Browse used products</li>
                <li>Make purchases securely</li>
                <li>Track your orders</li>
                <li>Manage your account settings</li>
            </ul>
            
            <p>If you have any questions or need assistance, feel free to contact our support team.</p>
            
            <div class="footer">
                <p>Best regards,<br>The GoRefurbish Team</p>
                <p><small>This is an automated email. Please do not reply to this message.</small></p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Test email connection
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service is ready to send emails');
      return { success: true, message: 'Email service connected successfully' };
    } catch (error) {
      console.error('Email service connection failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export default EmailService;
