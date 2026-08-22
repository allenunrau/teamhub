import "server-only";
import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null | undefined;

function getTransporter() {
  if (transporter !== undefined) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST) {
    transporter = null;
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT ? Number(SMTP_PORT) : 587,
    secure: Number(SMTP_PORT) === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
  return transporter;
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  const from = process.env.SMTP_FROM || "Team App <no-reply@example.com>";
  const t = getTransporter();

  if (!t) {
    // No SMTP configured: log the message so invites are still usable in dev.
    console.log(
      `\n--- Email (SMTP not configured, logging instead) ---\nTo: ${opts.to}\nSubject: ${opts.subject}\n\n${opts.text}\n------------------------------------------------------\n`
    );
    return;
  }

  await t.sendMail({ from, to: opts.to, subject: opts.subject, text: opts.text, html: opts.html });
}

export async function sendInviteEmail(opts: {
  to: string;
  inviteUrl: string;
  invitedByName: string;
  role: string;
}) {
  const subject = `You're invited to join the team`;
  const text = `${opts.invitedByName} invited you to join their team workspace as ${opts.role.toLowerCase()}.\n\nAccept your invite: ${opts.inviteUrl}\n\nThis link expires in 7 days.`;
  const html = `
    <p>${escapeHtml(opts.invitedByName)} invited you to join their team workspace as <strong>${escapeHtml(opts.role.toLowerCase())}</strong>.</p>
    <p><a href="${opts.inviteUrl}" style="display:inline-block;padding:10px 18px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Accept invite</a></p>
    <p>Or copy this link: <br/>${opts.inviteUrl}</p>
    <p style="color:#666;font-size:13px">This link expires in 7 days.</p>
  `;
  await sendMail({ to: opts.to, subject, text, html });
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
