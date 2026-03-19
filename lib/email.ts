// lib/email.ts
import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || "no-reply@yourdomain.com";
const FROM_NAME = process.env.FROM_NAME || "Your App";

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  // Don't throw here — but log so you notice
  console.warn(
    "SMTP not fully configured. Set SMTP_HOST/SMTP_USER/SMTP_PASS in .env"
  );
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

export interface FineEmailData {
  student: {
    name?: string;
    email?: string;
    register_number?: string;
  };
  issuedBy: {
    name?: string;
    email?: string;
    department?: string;
  };
  amount: number;
  reason: string;
  issuedDate: Date | string;
  dueDate: Date | string;
  status: string;
  paymentDate?: Date | string | null;
  fineId?: string;
  appUrl?: string;
}

export interface SendPasswordOptions {
  to: string;
  plainPassword: string;
  name?: string;
  loginUrl?: string; // optional link to login page
}

/**
 * Send password email using nodemailer (SMTP).
 * Returns true if email sent, false otherwise.
 */
export async function sendPasswordEmail(
  opts: SendPasswordOptions
): Promise<boolean> {
  const { to, plainPassword, name = "User", loginUrl } = opts;

  // create transport
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  // plain text and HTML templates
  const subject = "Your account password";
  const text = `Hello ${name},

Your account has been created.

Email: ${to}
Password: ${plainPassword}

${
  loginUrl ? `Login here: ${loginUrl}\n\n` : ""
}Please change your password after first login.

If you did not request this, ignore this email.
`;

  const html = `
  <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.4;">
    <h2>Hello ${name},</h2>
    <p>Your account has been created.</p>
    <table cellpadding="6" cellspacing="0" style="border-collapse: collapse;">
      <tr>
        <td style="font-weight: bold;">Email</td><td>${to}</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">Password</td><td style="font-family: monospace;">${plainPassword}</td>
      </tr>
    </table>
    ${loginUrl ? `<p><a href="${loginUrl}">Click here to login</a></p>` : ""}
    <p style="font-size: 0.9em; color:#666;">Please change your password after first login.</p>
  </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Password email sent:", info?.messageId || info);
    return true;
  } catch (err) {
    console.error("sendPasswordEmail error:", err);
    return false;
  }
}

/** send immediate fine notification */
export async function sendFineNotificationEmail(data: FineEmailData) {
  const {
    student,
    issuedBy,
    amount,
    reason,
    issuedDate,
    dueDate,
    status,
    paymentDate,
    fineId,
    appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  } = data;

  const to = student.email;
  const subject = `New Fine Issued — ₹${amount}`;

  const text = `Hello ${student.name || "Student"},

A new fine has been issued to you.

Amount: ₹${amount}
Reason: ${reason}
Issued by: ${issuedBy.name || "Faculty"}
Issued date: ${new Date(issuedDate).toLocaleString()}
Due date: ${new Date(dueDate).toLocaleString()}
Status: ${status}

${
  paymentDate
    ? `Payment date: ${new Date(paymentDate).toLocaleString()}\n\n`
    : ""
}

You can view the fine here: ${appUrl}/fines/${fineId}

If you have questions, contact ${issuedBy.name || "the faculty"} (${
    issuedBy.email || "—"
  }).

Regards,
${FROM_NAME}
`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.5;">
      <h2>New Fine Issued</h2>
      <p>Hello ${student.name || "Student"},</p>
      <p><strong>A new fine has been issued to you.</strong></p>
      <table cellpadding="6">
        <tr><td><strong>Amount</strong></td><td>₹${amount}</td></tr>
        <tr><td><strong>Reason</strong></td><td>${reason}</td></tr>
        <tr><td><strong>Issued by</strong></td><td>${issuedBy.name || "-"} (${
    issuedBy.email || "-"
  })</td></tr>
        <tr><td><strong>Issued date</strong></td><td>${new Date(
          issuedDate
        ).toLocaleString()}</td></tr>
        <tr><td><strong>Due date</strong></td><td>${new Date(
          dueDate
        ).toLocaleString()}</td></tr>
        <tr><td><strong>Status</strong></td><td>${status}</td></tr>
        ${
          paymentDate
            ? `<tr><td><strong>Payment date</strong></td><td>${new Date(
                paymentDate
              ).toLocaleString()}</td></tr>`
            : ""
        }
      </table>

      <p style="margin-top:12px;">
        <a href="${appUrl}/fines/${fineId}" style="background:#2563eb;color:#fff;padding:8px 12px;border-radius:6px;text-decoration:none;">
          View fine details
        </a>
      </p>

      <p style="font-size:0.9em;color:#666;margin-top:16px;">Please pay by the due date to avoid penalties.</p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      text,
      html,
    });
    console.log("sendFineNotificationEmail sent:", info?.messageId || info);
    return true;
  } catch (err) {
    console.error("sendFineNotificationEmail error:", err);
    return false;
  }
}

/** send reminder email (3 days before due date) */
export async function sendFineReminderEmail(data: FineEmailData) {
  const {
    student,
    issuedBy,
    amount,
    reason,
    dueDate,
    fineId,
    appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  } = data;

  const to = student.email;
  const subject = `Reminder: Fine due in 3 days — ₹${amount}`;

  const text = `Hello ${student.name || "Student"},

Reminder: your fine of ₹${amount} is due on ${new Date(
    dueDate
  ).toLocaleDateString()}.

Reason: ${reason}
Issued by: ${issuedBy.name || "Faculty"}

Please pay by the due date to avoid penalties:
${appUrl}/fines/${fineId}

Regards,
${FROM_NAME}
`;

  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h3>Reminder — Fine due in 3 days</h3>
      <p>Hello ${student.name || "Student"},</p>
      <p>Your fine of <strong>₹${amount}</strong> is due on <strong>${new Date(
    dueDate
  ).toLocaleString()}</strong>.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p><strong>Issued by:</strong> ${issuedBy.name || "-"}</p>

      <p style="margin-top:12px;">
        <a href="${appUrl}/fines/${fineId}" style="background:#f59e0b;color:#fff;padding:8px 12px;border-radius:6px;text-decoration:none;">
          View fine & pay
        </a>
      </p>

      <p style="font-size:0.9em;color:#666;margin-top:16px;">If you already paid, ignore this message.</p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      text,
      html,
    });
    console.log("sendFineReminderEmail sent:", info?.messageId || info);
    return true;
  } catch (err) {
    console.error("sendFineReminderEmail error:", err);
    return false;
  }
}
