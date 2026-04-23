const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS  // Use App Password for Gmail
    }
  });
};

/**
 * Send a promotional offer email to a user
 */
const sendOfferEmail = async (toEmail, toName, subject, offerTitle, offerDescription, discountCode) => {
  const transporter = createTransporter();

  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, sans-serif; background: #0f0f1a; }
      .container { max-width: 520px; margin: 0 auto; background: #1a1a2e; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); }
      .header { background: linear-gradient(135deg, #6C5CE7, #00CEC9); padding: 40px 30px; text-align: center; }
      .header h1 { color: white; margin: 0; font-size: 28px; }
      .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px; }
      .body { padding: 32px; }
      .greeting { color: #eaeaea; font-size: 18px; font-weight: 600; margin-bottom: 16px; }
      .message { color: #a0a0b8; font-size: 15px; line-height: 1.7; margin-bottom: 24px; }
      .offer-box { background: linear-gradient(135deg, rgba(108,92,231,0.15), rgba(0,206,201,0.15)); border: 1px solid rgba(108,92,231,0.3); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px; }
      .offer-title { color: #A29BFE; font-size: 20px; font-weight: 700; margin-bottom: 8px; }
      .offer-desc { color: #a0a0b8; font-size: 14px; margin-bottom: 16px; }
      .discount-code { display: inline-block; background: rgba(253,203,110,0.15); border: 1px dashed #FDCB6E; color: #FDCB6E; padding: 10px 28px; border-radius: 8px; font-size: 22px; font-weight: 800; letter-spacing: 4px; font-family: monospace; }
      .cta { display: inline-block; background: linear-gradient(135deg, #6C5CE7, #4834D4); color: white; padding: 14px 36px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px; margin-top: 16px; }
      .footer { text-align: center; padding: 24px; border-top: 1px solid rgba(255,255,255,0.05); }
      .footer p { color: #6c6c80; font-size: 12px; margin: 0; }
      .emoji { font-size: 40px; margin-bottom: 12px; }
    </style>
  </head>
  <body>
    <div style="padding: 20px; background: #0f0f1a;">
      <div class="container">
        <div class="header">
          <div class="emoji">🍽️</div>
          <h1>DineSync</h1>
          <p>A Special Offer Just For You!</p>
        </div>
        <div class="body">
          <div class="greeting">Hey ${toName || 'Food Lover'}! 👋</div>
          <div class="message">
            We miss you at DineSync! Come back and taste our amazing food.
            We've prepared something special just for you.
          </div>
          <div class="offer-box">
            <div class="offer-title">🎉 ${offerTitle}</div>
            <div class="offer-desc">${offerDescription}</div>
            <div class="discount-code">${discountCode}</div>
          </div>
          <div class="message">
            Simply show this code at checkout or enter it online to redeem your offer.
            Hurry — this won't last forever! ⏳
          </div>
          <div style="text-align: center;">
            <a href="#" class="cta">🍕 Order Now</a>
          </div>
        </div>
        <div class="footer">
          <p>🍽️ DineSync Restaurant | Made with ❤️</p>
          <p style="margin-top: 8px;">You're receiving this because you dined with us.</p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  const mailOptions = {
    from: `"DineSync Restaurant 🍽️" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: subject || '🎉 Special Offer from DineSync!',
    html: htmlContent
  };

  return transporter.sendMail(mailOptions);
};

const sendResetPasswordEmail = async (toEmail, toName, otp) => {
  const transporter = createTransporter();

  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, sans-serif; background: #0f0f1a; }
      .container { max-width: 520px; margin: 0 auto; background: #1a1a2e; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); }
      .header { background: linear-gradient(135deg, #FF7675, #6C5CE7); padding: 40px 30px; text-align: center; }
      .header h1 { color: white; margin: 0; font-size: 28px; }
      .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px; }
      .body { padding: 32px; }
      .greeting { color: #eaeaea; font-size: 18px; font-weight: 600; margin-bottom: 16px; }
      .message { color: #a0a0b8; font-size: 15px; line-height: 1.7; margin-bottom: 24px; }
      .otp-box { background: rgba(108, 92, 231, 0.1); border: 2px dashed #6C5CE7; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
      .otp-code { color: #A29BFE; font-size: 36px; font-weight: 800; letter-spacing: 12px; font-family: monospace; }
      .footer { text-align: center; padding: 24px; border-top: 1px solid rgba(255,255,255,0.05); }
      .footer p { color: #6c6c80; font-size: 12px; margin: 0; }
    </style>
  </head>
  <body>
    <div style="padding: 20px; background: #0f0f1a;">
      <div class="container">
        <div class="header">
          <h1>DineSync</h1>
          <p>Password Reset Code</p>
        </div>
        <div class="body">
          <div class="greeting">Hi ${toName || 'User'}! 👋</div>
          <div class="message">
            Your requested password reset code is below. This code will expire in 10 minutes.
          </div>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>
          <div class="message" style="margin-top: 24px; font-size: 13px;">
            If you did not request this, please ignore this email and your password will remain unchanged.
          </div>
        </div>
        <div class="footer">
          <p>🍽️ DineSync Restaurant | Made with ❤️</p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  const mailOptions = {
    from: `"DineSync Restaurant 🍽️" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Your Password Reset Code: ${otp}`,
    html: htmlContent
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendOfferEmail, sendResetPasswordEmail };
