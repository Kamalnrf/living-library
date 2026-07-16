import { email } from "https://esm.town/v/std/email";
import {
  claimEmailJob,
  listReadyEmailJobs,
  markEmailAccepted,
  markEmailFailed,
  type EmailJob,
} from "./db.ts";

// Email jobs are persisted before delivery so a temporary send failure never
// loses the inquiry itself.
const PARTNER_EMAIL = "partner@livingstoriescollective.org";
const FROM_EMAIL = {
  email: "kamalnrf.partner-inquiries@valtown.email",
  name: "Living Stories Collective",
};

function confirmationMessage(job: EmailJob) {
  return {
    from: FROM_EMAIL,
    to: job.recipient,
    replyTo: PARTNER_EMAIL,
    subject: "We received your partnership inquiry",
    text: `Hi ${job.inquiry.name},

Thank you for reaching out to Living Stories Collective. We’ve received your partnership inquiry and a member of our team will get back to you soon.

If you’d like to add anything, reply to this email and it will reach us at ${PARTNER_EMAIL}.

Warmly,
Living Stories Collective`,
  };
}

function notificationMessage(job: EmailJob) {
  const inquiry = job.inquiry;
  return {
    from: FROM_EMAIL,
    to: job.recipient,
    replyTo: { email: inquiry.email, name: inquiry.name },
    subject: `New partner inquiry — ${inquiry.organisation}`,
    text: `A new partner inquiry was submitted.

Name: ${inquiry.name}
Organisation: ${inquiry.organisation}
Email: ${inquiry.email}
Inquiry ID: ${inquiry.id}

Message:
${inquiry.message}

Reply to this email to respond directly to ${inquiry.name}.`,
  };
}

async function deliverJob(job: EmailJob) {
  const attempt = await claimEmailJob(job.id);
  if (attempt === null) return;

  try {
    const result = await email(
      job.kind === "confirmation"
        ? confirmationMessage(job)
        : notificationMessage(job),
    );
    await markEmailAccepted(job.id, attempt);
    console.info("Partner email accepted", {
      jobId: job.id,
      kind: job.kind,
      result: result.message,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await markEmailFailed(job.id, attempt, message);
    console.error("Partner email failed", {
      jobId: job.id,
      kind: job.kind,
      error: message,
    });
  }
}

export async function deliverReadyEmails(limit = 10) {
  const jobs = await listReadyEmailJobs(limit);
  await Promise.all(jobs.map(deliverJob));
  return jobs.length;
}
