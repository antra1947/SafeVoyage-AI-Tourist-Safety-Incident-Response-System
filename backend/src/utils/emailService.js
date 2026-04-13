const nodemailer = require("nodemailer");

const createTransporter = () => {
  if (process.env.EMAIL_PROVIDER === "ses") {
    return nodemailer.createTransport({
      host: process.env.SES_HOST,
      port: parseInt(process.env.SES_PORT) || 587,
      secure: false,
      auth: { user: process.env.SES_USER, pass: process.env.SES_PASS },
    });
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
};

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = createTransporter();
    const from = `"SafeVoyage AI" <${process.env.EMAIL_USER || process.env.SES_USER}>`;
    await transporter.sendMail({ from, to, subject, text, html });
    return true;
  } catch (err) {
    console.error("Email send failed:", err.message);
    return false;
  }
};

// Rich HTML SOS alert email for emergency contacts
const buildSOSAlertHTML = ({ name, victimName, message, lat, lng, timestamp, alertId }) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#c0392b,#922b21);padding:30px;text-align:center;">
          <div style="font-size:48px;margin-bottom:8px;">🆘</div>
          <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;letter-spacing:1px;">EMERGENCY SOS ALERT</h1>
          <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px;">SafeVoyage AI Tourist Safety System</p>
        </td></tr>
        <!-- Alert Banner -->
        <tr><td style="background:#fdecea;padding:16px 30px;border-left:4px solid #c0392b;">
          <p style="margin:0;color:#c0392b;font-weight:700;font-size:15px;">
            ⚠️ ${victimName} has triggered an emergency SOS alert and needs immediate help!
          </p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:30px;">
          <p style="color:#555;font-size:14px;margin:0 0 20px;">Dear <strong>${name}</strong>,</p>
          <p style="color:#555;font-size:14px;margin:0 0 20px;">
            You are listed as an emergency contact for <strong>${victimName}</strong>. 
            They have activated the SafeVoyage emergency SOS system. Please take immediate action.
          </p>

          <!-- Details Box -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border-radius:8px;padding:20px;margin-bottom:20px;">
            <tr><td style="padding:8px 0;border-bottom:1px solid #eee;">
              <span style="color:#888;font-size:12px;text-transform:uppercase;font-weight:600;">Person in Distress</span><br/>
              <span style="color:#2c3e50;font-size:15px;font-weight:700;">${victimName}</span>
            </td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #eee;">
              <span style="color:#888;font-size:12px;text-transform:uppercase;font-weight:600;">Emergency Message</span><br/>
              <span style="color:#c0392b;font-size:14px;font-weight:600;">"${message}"</span>
            </td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #eee;">
              <span style="color:#888;font-size:12px;text-transform:uppercase;font-weight:600;">GPS Location</span><br/>
              <span style="color:#2c3e50;font-size:14px;">Latitude: ${lat} | Longitude: ${lng}</span><br/>
              <a href="https://maps.google.com/?q=${lat},${lng}" style="color:#2980b9;font-size:13px;text-decoration:none;">
                📍 Open in Google Maps →
              </a>
            </td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #eee;">
              <span style="color:#888;font-size:12px;text-transform:uppercase;font-weight:600;">Alert Time</span><br/>
              <span style="color:#2c3e50;font-size:14px;">${timestamp}</span>
            </td></tr>
            <tr><td style="padding:8px 0;">
              <span style="color:#888;font-size:12px;text-transform:uppercase;font-weight:600;">Alert ID</span><br/>
              <span style="color:#888;font-size:12px;font-family:monospace;">${alertId}</span>
            </td></tr>
          </table>

          <!-- Emergency Numbers -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff3cd;border-radius:8px;padding:16px;margin-bottom:20px;border:1px solid #ffc107;">
            <tr><td>
              <p style="margin:0 0 10px;font-weight:700;color:#856404;font-size:13px;">📞 EMERGENCY NUMBERS (INDIA)</p>
              <table width="100%">
                <tr>
                  <td style="padding:4px 8px;"><span style="background:#c0392b;color:#fff;padding:2px 8px;border-radius:4px;font-weight:700;font-size:13px;">100</span> <span style="font-size:13px;color:#555;">Police</span></td>
                  <td style="padding:4px 8px;"><span style="background:#c0392b;color:#fff;padding:2px 8px;border-radius:4px;font-weight:700;font-size:13px;">108</span> <span style="font-size:13px;color:#555;">Ambulance</span></td>
                </tr>
                <tr>
                  <td style="padding:4px 8px;"><span style="background:#c0392b;color:#fff;padding:2px 8px;border-radius:4px;font-weight:700;font-size:13px;">101</span> <span style="font-size:13px;color:#555;">Fire</span></td>
                  <td style="padding:4px 8px;"><span style="background:#c0392b;color:#fff;padding:2px 8px;border-radius:4px;font-weight:700;font-size:13px;">1091</span> <span style="font-size:13px;color:#555;">Women Helpline</span></td>
                </tr>
              </table>
            </td></tr>
          </table>

          <p style="color:#888;font-size:12px;margin:0;">
            This alert was sent automatically by SafeVoyage AI. Please do not reply to this email.
            If this was a false alarm, please contact the person directly.
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f8f9fa;padding:16px 30px;text-align:center;border-top:1px solid #eee;">
          <p style="margin:0;color:#aaa;font-size:11px;">SafeVoyage AI — Tourist Safety & Incident Response System</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

// Confirmation email to the SOS sender
const buildSOSConfirmationHTML = ({ firstName, notifiedContacts, message, lat, lng, timestamp, alertId }) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
        <tr><td style="background:linear-gradient(135deg,#27ae60,#1e8449);padding:30px;text-align:center;">
          <div style="font-size:48px;margin-bottom:8px;">✅</div>
          <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800;">SOS Alert Sent Successfully</h1>
          <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px;">SafeVoyage AI Tourist Safety System</p>
        </td></tr>
        <tr><td style="padding:30px;">
          <p style="color:#555;font-size:14px;margin:0 0 16px;">Hi <strong>${firstName}</strong>,</p>
          <p style="color:#555;font-size:14px;margin:0 0 20px;">
            Your SOS alert has been sent. Here's a summary of who was notified and what was shared.
          </p>

          <!-- Alert Details -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border-radius:8px;padding:20px;margin-bottom:20px;">
            <tr><td style="padding:8px 0;border-bottom:1px solid #eee;">
              <span style="color:#888;font-size:12px;text-transform:uppercase;font-weight:600;">Your Message</span><br/>
              <span style="color:#2c3e50;font-size:14px;">"${message}"</span>
            </td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #eee;">
              <span style="color:#888;font-size:12px;text-transform:uppercase;font-weight:600;">Location Shared</span><br/>
              <span style="color:#2c3e50;font-size:14px;">Lat: ${lat} | Lng: ${lng}</span><br/>
              <a href="https://maps.google.com/?q=${lat},${lng}" style="color:#2980b9;font-size:13px;">📍 View on Google Maps</a>
            </td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #eee;">
              <span style="color:#888;font-size:12px;text-transform:uppercase;font-weight:600;">Alert Time</span><br/>
              <span style="color:#2c3e50;font-size:14px;">${timestamp}</span>
            </td></tr>
            <tr><td style="padding:8px 0;">
              <span style="color:#888;font-size:12px;text-transform:uppercase;font-weight:600;">Alert ID</span><br/>
              <span style="color:#888;font-size:12px;font-family:monospace;">${alertId}</span>
            </td></tr>
          </table>

          <!-- Notified Contacts -->
          <p style="font-weight:700;color:#2c3e50;font-size:14px;margin:0 0 10px;">📧 Emergency Contacts Notified:</p>
          ${notifiedContacts.length > 0
            ? notifiedContacts.map(c => `
              <div style="background:#eafaf1;border:1px solid #27ae60;border-radius:8px;padding:10px 14px;margin-bottom:8px;">
                <span style="font-weight:700;color:#1e8449;">${c.name}</span>
                <span style="color:#555;font-size:13px;"> — ${c.email}</span>
                <span style="float:right;background:#27ae60;color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;">✓ Notified</span>
              </div>`).join("")
            : `<div style="background:#fdecea;border-radius:8px;padding:12px;color:#c0392b;font-size:13px;">
                ⚠️ No emergency contacts found. Please add emergency contacts in your profile to ensure alerts are sent.
               </div>`
          }

          <!-- Emergency Numbers -->
          <div style="background:#fff3cd;border-radius:8px;padding:16px;margin-top:20px;border:1px solid #ffc107;">
            <p style="margin:0 0 8px;font-weight:700;color:#856404;font-size:13px;">📞 Emergency Numbers (India)</p>
            <p style="margin:0;font-size:13px;color:#555;">
              <strong>Police:</strong> 100 &nbsp;|&nbsp; <strong>Ambulance:</strong> 108 &nbsp;|&nbsp; <strong>Fire:</strong> 101 &nbsp;|&nbsp; <strong>Women Helpline:</strong> 1091
            </p>
          </div>

          <p style="color:#888;font-size:12px;margin-top:20px;">
            Stay safe. If you are in immediate danger, please call emergency services directly.
          </p>
        </td></tr>
        <tr><td style="background:#f8f9fa;padding:16px 30px;text-align:center;border-top:1px solid #eee;">
          <p style="margin:0;color:#aaa;font-size:11px;">SafeVoyage AI — Tourist Safety & Incident Response System</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

module.exports = { sendEmail, buildSOSAlertHTML, buildSOSConfirmationHTML };
