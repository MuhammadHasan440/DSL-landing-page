require("dotenv").config();

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

app.use(cors());
app.use(express.json());

/*=========================================
            SMTP CONFIGURATION
==========================================*/

// Force IPv4 by disabling IPv6
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    pool: true,
    maxConnections: 5,
    maxMessages: Infinity,
    rateLimit: 5, // Max 5 messages per second
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false,
        // Force TLS 1.2
        minVersion: 'TLSv1.2'
    },
    // Connection timeout settings
    connectionTimeout: 10000, // 10 seconds
    socketTimeout: 10000, // 10 seconds
    greetingTimeout: 10000, // 10 seconds
    // Enable debug for troubleshooting
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development'
});

/*=========================================
        SMTP VERIFICATION ON STARTUP
==========================================*/

const verifySMTPConnection = async () => {
    try {
        await transporter.verify();
        console.log('✅ SMTP connection verified successfully');
        console.log(`📧 Connected to Gmail SMTP (smtp.gmail.com:587)`);
        console.log(`👤 Authenticated as: ${process.env.EMAIL_USER}`);
        return true;
    } catch (error) {
        console.error('❌ SMTP connection failed:', error.message);
        console.error('⚠️  Please check your EMAIL_USER and EMAIL_PASS in .env file');
        console.error('⚠️  Make sure you are using an App Password, not your regular Gmail password');
        return false;
    }
};

/*=========================================
        BACKGROUND EMAIL QUEUE
==========================================*/

const sendEmailsInBackground = async (adminMailOptions, customerMailOptions) => {
    try {
        // Send both emails in parallel
        const emailPromises = [
            transporter.sendMail(adminMailOptions),
            transporter.sendMail(customerMailOptions)
        ];
        
        const results = await Promise.allSettled(emailPromises);
        
        // Log results
        results.forEach((result, index) => {
            const type = index === 0 ? 'Admin' : 'Customer Auto-Reply';
            if (result.status === 'fulfilled') {
                console.log(`✅ ${type} email sent successfully`);
            } else {
                console.error(`❌ ${type} email failed:`, result.reason.message);
            }
        });
    } catch (error) {
        console.error('❌ Background email sending error:', error);
    }
};

/*=========================================
            CONTACT API
==========================================*/

app.post("/api/contact", async (req, res) => {
    try {
        const { name, email, message } = req.body;

        /*==========================
            Validation
        ==========================*/

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "Please fill all fields."
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address."
            });
        }

        /*==========================
            Current Date
        ==========================*/

        const date = new Date().toLocaleString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });

        /*==========================
            ADMIN EMAIL TEMPLATE
        ==========================*/

        const adminMailOptions = {
            from: `"DSL Website" <${process.env.EMAIL_USER}>`,
            to: process.env.RECEIVER_EMAIL,
            replyTo: email,
            subject: ` New Consultation Request - ${name}`,
            html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>New Contact</title>
</head>

<body style="
margin:0;
padding:40px;
background:#111118;
font-family:'Segoe UI',Arial,sans-serif;
">

<table width="100%" cellspacing="0" cellpadding="0">
<tr>
<td align="center">
<table width="680" cellpadding="0" cellspacing="0" style="
background:#1D1D27;
border-radius:22px;
overflow:hidden;
border:1px solid #2B2B3D;
">

<!--=====================
        HEADER
======================-->

<tr>
<td style="
padding:45px;
text-align:center;
background:linear-gradient(90deg,#F22923,#860EBE);
">
<h1 style="
margin:0;
color:#fff;
font-size:34px;
font-weight:700;
">
🚀 New Consultation Request
</h1>
<p style="
margin-top:12px;
color:#F4F4F4;
font-size:16px;
">
Someone has submitted your website contact form.
</p>
</td>
</tr>

<!--=====================
        BODY
======================-->

<tr>
<td style="padding:40px;">
<h2 style="
margin:0 0 30px;
color:#fff;
font-size:24px;
">
Lead Information
</h2>

<!-- Name -->
<table width="100%" style="
background:#272735;
border-radius:14px;
margin-bottom:18px;
">
<tr>
<td style="padding:18px;">
<p style="
margin:0;
font-size:12px;
color:#8D90A6;
text-transform:uppercase;
letter-spacing:1px;
">
Full Name
</p>
<h3 style="
margin:8px 0 0;
font-size:20px;
color:#fff;
">
${name}
</h3>
</td>
</tr>
</table>

<!-- Email -->
<table width="100%" style="
background:#272735;
border-radius:14px;
margin-bottom:18px;
">
<tr>
<td style="padding:18px;">
<p style="
margin:0;
font-size:12px;
color:#8D90A6;
text-transform:uppercase;
">
Email Address
</p>
<h3 style="
margin:8px 0 0;
font-size:18px;
">
<a href="mailto:${email}" style="
color:#B57CFF;
text-decoration:none;
">
${email}
</a>
</h3>
</td>
</tr>
</table>

<!-- Message -->
<table width="100%" style="
background:#272735;
border-radius:14px;
margin-bottom:25px;
">
<tr>
<td style="padding:20px;">
<p style="
margin:0;
font-size:12px;
color:#8D90A6;
text-transform:uppercase;
">
Message
</p>
<p style="
margin:14px 0 0;
color:#F5F5F5;
line-height:30px;
font-size:16px;
">
${message}
</p>
</td>
</tr>
</table>

<!-- Date -->
<table width="100%" style="
background:#272735;
border-radius:14px;
">
<tr>
<td style="padding:18px;">
<p style="
margin:0;
font-size:12px;
color:#8D90A6;
text-transform:uppercase;
">
Submitted On
</p>
<h4 style="
margin:8px 0 0;
font-size:17px;
color:#fff;
">
${date}
</h4>
</td>
</tr>
</table>

</td>
</tr>

<!--=====================
        BUTTON
======================-->

<tr>
<td align="center" style="padding:10px 40px 40px;">
<a href="mailto:${email}" style="
display:inline-block;
padding:18px 38px;
background:linear-gradient(90deg,#F22923,#860EBE);
border-radius:60px;
color:#fff;
text-decoration:none;
font-weight:700;
font-size:16px;
">
Reply to ${name}
</a>
</td>
</tr>

<!--=====================
        FOOTER
======================-->

<tr>
<td style="
padding:30px;
text-align:center;
background:#171721;
border-top:1px solid #2D2D3D;
">
<p style="
margin:0;
color:#9A9AAF;
font-size:14px;
">
This email was automatically generated from your website contact form.
</p>
<p style="
margin-top:10px;
color:#6E7084;
font-size:12px;
">
© 2026 DSL • All Rights Reserved
</p>
</td>
</tr>

</table>
</td>
</tr>
</table>

</body>
</html>
            `
        };

        /*==========================
            AUTO-REPLY EMAIL TEMPLATE
        ==========================*/

        const customerMailOptions = {
            from: `"DSL Team" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Thank you for contacting DSL",
            html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Thank You</title>
</head>

<body style="
margin:0;
padding:40px;
background:#111118;
font-family:'Segoe UI',Arial,sans-serif;
">

<table width="100%" cellspacing="0" cellpadding="0">
<tr>
<td align="center">
<table width="680" cellpadding="0" cellspacing="0" style="
background:#1D1D27;
border-radius:22px;
overflow:hidden;
border:1px solid #2B2B3D;
">

<!--=====================
        HEADER
======================-->

<tr>
<td style="
padding:45px;
text-align:center;
background:linear-gradient(90deg,#F22923,#860EBE);
">
<h1 style="
margin:0;
color:#fff;
font-size:34px;
font-weight:700;
">
🙏 Thank You!
</h1>
<p style="
margin-top:12px;
color:#F4F4F4;
font-size:16px;
">
We've received your consultation request
</p>
</td>
</tr>

<!--=====================
        BODY
======================-->

<tr>
<td style="padding:40px;">
<h2 style="
margin:0 0 20px;
color:#fff;
font-size:24px;
">
Hello ${name},
</h2>

<p style="
color:#D0D0E0;
font-size:16px;
line-height:28px;
margin-bottom:20px;
">
Thank you for reaching out to <strong>DSL</strong>. We appreciate your interest in our services.
</p>

<p style="
color:#D0D0E0;
font-size:16px;
line-height:28px;
margin-bottom:30px;
">
A member of our team will review your message and get back to you within <strong>24-48 hours</strong>.
</p>

<!-- Message Preview -->
<table width="100%" style="
background:#272735;
border-radius:14px;
margin-bottom:25px;
">
<tr>
<td style="padding:20px;">
<p style="
margin:0;
font-size:12px;
color:#8D90A6;
text-transform:uppercase;
">
Your Message
</p>
<p style="
margin:14px 0 0;
color:#F5F5F5;
line-height:30px;
font-size:16px;
font-style:italic;
">
"${message}"
</p>
</td>
</tr>
</table>

<p style="
color:#8D90A6;
font-size:14px;
line-height:24px;
">
In the meantime, feel free to:
</p>
<ul style="
color:#D0D0E0;
font-size:14px;
line-height:30px;
padding-left:20px;
">
<li>Visit our website: <a href="#" style="color:#B57CFF;text-decoration:none;">www.dsl.com</a></li>
<li>Follow us on social media for updates</li>
<li>Check your email for our response</li>
</ul>

</td>
</tr>

<!--=====================
        FOOTER
======================-->

<tr>
<td style="
padding:30px;
text-align:center;
background:#171721;
border-top:1px solid #2D2D3D;
">
<p style="
margin:0;
color:#9A9AAF;
font-size:14px;
">
This is an automated confirmation. Please do not reply to this email.
</p>
<p style="
margin-top:10px;
color:#6E7084;
font-size:12px;
">
© 2026 DSL • All Rights Reserved
</p>
</td>
</tr>

</table>
</td>
</tr>
</table>

</body>
</html>
            `
        };

        /*==========================
            Send Emails in Background
        ==========================*/

        // Start background email sending without blocking the response
        sendEmailsInBackground(adminMailOptions, customerMailOptions).catch(error => {
            console.error('🔥 Background email error:', error);
        });

        /*==========================
            Immediate Response
        ==========================*/

        return res.status(200).json({
            success: true,
            message: "Your message has been sent successfully. We'll get back to you soon!"
        });

    } catch (error) {
        console.error("🔥 Contact API Error:", error);
        
        // Don't expose internal errors to client
        return res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again later or contact us directly."
        });
    }
});

/*=========================================
        HEALTH CHECK ENDPOINT
==========================================*/

app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString()
    });
});

/*=========================================
        ERROR HANDLING MIDDLEWARE
==========================================*/

app.use((err, req, res, next) => {
    console.error('❌ Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err);
    // Keep the server running
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('💥 Unhandled Rejection:', err);
    // Keep the server running
});

/*=========================================
            SERVER STARTUP
==========================================*/

const PORT = process.env.PORT || 5000;

// Start server with SMTP verification
const startServer = async () => {
    try {
        // Verify SMTP connection on startup
        const isSMTPVerified = await verifySMTPConnection();
        
        if (!isSMTPVerified) {
            console.warn('⚠️  SMTP connection failed. The server will still start, but email sending may not work.');
        }

        app.listen(PORT, () => {
            console.log(`🚀 Server Running On http://localhost:${PORT}`);
            console.log(`📡 API Endpoint: http://localhost:${PORT}/api/contact`);
            console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
            
            if (isSMTPVerified) {
                console.log('✅ All systems ready!');
            } else {
                console.log('⚠️  Server started but SMTP is not configured properly.');
            }
        });
    } catch (error) {
        console.error('🔥 Server startup error:', error);
        process.exit(1);
    }
};

startServer();