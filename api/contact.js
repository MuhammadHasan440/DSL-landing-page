/**
 * Serverless Contact Form API for Vercel
 * Firebase Firestore + Nodemailer Email
 */

const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const cors = require('cors');
const express = require('express');

// ==================== EXPRESS APP ====================
const app = express();

// ==================== CORS - FIXED ====================
// Allow all origins for testing (production mein specific domain daalein)
app.use(cors({
  origin: '*',  // ⭐ Sab ko allow karein
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle preflight requests manually
app.options('*', cors()); // Enable preflight for all routes

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ==================== FIREBASE ADMIN INIT ====================
try {
  if (!admin.apps.length) {
    if (!process.env.FIREBASE_PROJECT_ID || 
        !process.env.FIREBASE_CLIENT_EMAIL || 
        !process.env.FIREBASE_PRIVATE_KEY) {
      console.error('❌ Firebase credentials missing!');
    } else {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      console.log('✅ Firebase initialized');
    }
  }
} catch (error) {
  console.error('❌ Firebase init error:', error.message);
}
const db = admin.apps.length > 0 ? admin.firestore() : null;

// ==================== EMAIL TRANSPORTER ====================
let transporter = null;
try {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2',
      },
    });
    console.log('✅ Email transporter created');
  } else {
    console.error('❌ SMTP credentials missing!');
  }
} catch (error) {
  console.error('❌ Email transporter error:', error.message);
}

// ==================== ADMIN EMAIL TEMPLATE ====================
const getAdminEmail = (data) => {
  const { name, email, phone, company, service, budget, message, ip, userAgent, createdAt } = data;
  const date = new Date(createdAt).toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:20px;background:#f4f6f9;font-family:Arial,sans-serif;">
  <table width="100%" cellspacing="0" cellpadding="0">
    <tr><td align="center">
      <table width="550" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.08);">
        <tr><td style="padding:25px;background:#1a1a2e;text-align:center;">
          <h2 style="margin:0;color:#ffffff;">📩 New Contact Form Submission</h2>
          <p style="margin:5px 0 0;color:#a8b2c8;font-size:13px;">${date}</p>
        </td></tr>
        <tr><td style="padding:25px;">
          <div style="margin-bottom:12px;"><strong>Name:</strong> ${name}</div>
          <div style="margin-bottom:12px;"><strong>Email:</strong> <a href="mailto:${email}" style="color:#e94560;">${email}</a></div>
          ${phone ? `<div style="margin-bottom:12px;"><strong>Phone:</strong> ${phone}</div>` : ''}
          ${company ? `<div style="margin-bottom:12px;"><strong>Company:</strong> ${company}</div>` : ''}
          ${service ? `<div style="margin-bottom:12px;"><strong>Service:</strong> ${service}</div>` : ''}
          ${budget ? `<div style="margin-bottom:12px;"><strong>Budget:</strong> ${budget}</div>` : ''}
          <div style="margin:15px 0;padding:15px;background:#f8f9fa;border-radius:6px;border-left:3px solid #e94560;">
            <strong>Message:</strong><br>${message}
          </div>
          <div style="font-size:12px;color:#6c757d;border-top:1px solid #e9ecef;padding-top:12px;">
            <div>IP: ${ip || 'N/A'}</div>
            <div>User Agent: ${userAgent || 'N/A'}</div>
          </div>
        </td></tr>
        <tr><td style="padding:15px;background:#f8f9fa;text-align:center;font-size:12px;color:#6c757d;">
          © ${new Date().getFullYear()} DSL. All rights reserved.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
};

// ==================== CUSTOMER REPLY EMAIL ====================
const getCustomerEmail = (data) => {
  const { name, message, company, service } = data;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:20px;background:#f4f6f9;font-family:Arial,sans-serif;">
  <table width="100%" cellspacing="0" cellpadding="0">
    <tr><td align="center">
      <table width="550" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.08);">
        <tr><td style="padding:25px;background:linear-gradient(135deg,#1a1a2e,#16213e);text-align:center;">
          <h2 style="margin:0;color:#ffffff;">🙏 Thank You!</h2>
          <p style="margin:5px 0 0;color:#a8b2c8;font-size:13px;">We've received your message</p>
        </td></tr>
        <tr><td style="padding:25px;">
          <p style="font-size:16px;color:#212529;">Hello <strong>${name}</strong>,</p>
          <p style="color:#495057;line-height:1.6;">Thank you for contacting <strong>DSL</strong>. We have successfully received your message. Our team will review it and get back to you within <strong>24-48 hours</strong>.</p>
          
          <div style="margin:15px 0;padding:15px;background:#f8f9fa;border-radius:6px;border-left:3px solid #e94560;">
            <strong style="font-size:13px;color:#6c757d;">Your Message:</strong><br>
            <p style="margin:5px 0 0;color:#212529;">"${message}"</p>
            ${company ? `<div style="margin-top:8px;font-size:13px;color:#495057;"><strong>Company:</strong> ${company}</div>` : ''}
            ${service ? `<div style="font-size:13px;color:#495057;"><strong>Service:</strong> ${service}</div>` : ''}
          </div>
          
          <p style="color:#495057;font-size:14px;">In the meantime, feel free to visit our website for more information.</p>
          
          <div style="text-align:center;margin:20px 0 10px;">
            <a href="#" style="display:inline-block;padding:10px 30px;background:#e94560;color:#ffffff;text-decoration:none;border-radius:50px;font-size:14px;font-weight:600;">Visit Our Website</a>
          </div>
        </td></tr>
        <tr><td style="padding:15px;background:#f8f9fa;text-align:center;font-size:12px;color:#6c757d;">
          <p style="margin:0;">This is an automated confirmation. Please do not reply to this email.</p>
          <p style="margin:5px 0 0;">© ${new Date().getFullYear()} DSL. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
};

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    platform: 'Vercel',
    firebase: db ? 'Connected' : 'Not Connected',
    email: transporter ? 'Configured' : 'Not Configured',
  });
});

// ==================== MAIN CONTACT ENDPOINT ====================
app.post('/api/contact', async (req, res) => {
  try {
    console.log('📨 Contact form submitted');

    // Check Firebase
    if (!db) {
      console.error('❌ Firebase not initialized');
      return res.status(500).json({
        success: false,
        message: 'Database connection error. Please try again later.',
      });
    }

    // Check Email
    if (!transporter) {
      console.error('❌ Email not configured');
      return res.status(500).json({
        success: false,
        message: 'Email service error. Please try again later.',
      });
    }

    const { name, email, phone = '', company = '', service = '', budget = '', message } = req.body;

    // Validation
    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!email?.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    }
    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }
    if (message.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Message must be at least 10 characters' });
    }

    const sanitized = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      company: company.trim(),
      service: service.trim(),
      budget: budget.trim(),
      message: message.trim(),
    };

    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
               req.socket?.remoteAddress ||
               req.ip ||
               'Unknown';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // Save to Firestore
    const firestoreData = {
      ...sanitized,
      ip,
      userAgent,
      status: 'new',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('contact_submissions').add(firestoreData);
    console.log(`✅ Firestore saved: ${docRef.id}`);

    const emailData = {
      ...sanitized,
      ip,
      userAgent,
      createdAt: new Date().toISOString(),
    };

    // Send Admin Email
    await transporter.sendMail({
      from: `"DSL Website" <${process.env.SMTP_USER}>`,
      to: process.env.OWNER_EMAIL,
      replyTo: sanitized.email,
      subject: `New Consultation Request - ${sanitized.name}`,
      html: getAdminEmail(emailData),
    });
    console.log('✅ Admin email sent');

    // Send Customer Reply
    await transporter.sendMail({
      from: `"DSL Team" <${process.env.SMTP_USER}>`,
      to: sanitized.email,
      subject: 'Thank you for contacting DSL',
      html: getCustomerEmail(emailData),
    });
    console.log('✅ Customer email sent');

    return res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully. We\'ll get back to you soon!',
      submissionId: docRef.id,
    });

  } catch (error) {
    console.error('🔥 Contact API Error:', error.message);
    console.error('📚 Stack:', error.stack);
    
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// ==================== EXPORT FOR VERCEL ====================
module.exports = app;