import { sqlite } from "https://esm.town/v/std/sqlite/main.ts";

export const INQUIRY_STATUSES = [
  "new",
  "contacted",
  "in_progress",
  "closed",
] as const;

export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];
export type EmailState = "pending" | "sending" | "accepted" | "failed";

export interface Inquiry {
  id: string;
  idempotency_key: string;
  created_at: string;
  updated_at: string;
  name: string;
  organisation: string;
  email: string;
  message: string;
  status: InquiryStatus;
  notes: string;
  confirmation_state: EmailState;
  notification_state: EmailState;
}

export interface EmailJob {
  id: string;
  inquiry_id: string;
  kind: "confirmation" | "notification";
  recipient: string;
  state: EmailState;
  attempt_count: number;
  last_error: string | null;
  inquiry: Inquiry;
}

export interface NewInquiry {
  id: string;
  idempotencyKey: string;
  name: string;
  organisation: string;
  email: string;
  message: string;
}

export async function initDb() {
  await sqlite.batch([
    `CREATE TABLE IF NOT EXISTS partner_inquiries (
      id TEXT PRIMARY KEY,
      idempotency_key TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      name TEXT NOT NULL,
      organisation TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new'
        CHECK (status IN ('new', 'contacted', 'in_progress', 'closed')),
      notes TEXT NOT NULL DEFAULT ''
    )`,
    `CREATE TABLE IF NOT EXISTS partner_email_outbox (
      id TEXT PRIMARY KEY,
      inquiry_id TEXT NOT NULL,
      kind TEXT NOT NULL CHECK (kind IN ('confirmation', 'notification')),
      recipient TEXT NOT NULL,
      state TEXT NOT NULL DEFAULT 'pending'
        CHECK (state IN ('pending', 'sending', 'accepted', 'failed')),
      attempt_count INTEGER NOT NULL DEFAULT 0,
      next_attempt_at TEXT NOT NULL DEFAULT (datetime('now')),
      accepted_at TEXT,
      last_error TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (inquiry_id) REFERENCES partner_inquiries(id),
      UNIQUE (inquiry_id, kind)
    )`,
    `CREATE INDEX IF NOT EXISTS partner_inquiries_created_at
      ON partner_inquiries(created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS partner_email_outbox_pending
      ON partner_email_outbox(state, next_attempt_at)`,
    `UPDATE partner_email_outbox
      SET state = 'failed', next_attempt_at = datetime('now'),
          last_error = 'Delivery attempt timed out and was queued again',
          updated_at = datetime('now')
      WHERE state = 'sending'
        AND updated_at <= datetime('now', '-15 minutes')`,
  ], "write");
}

export async function findInquiryByIdempotencyKey(key: string) {
  const result = await sqlite.execute({
    sql: `SELECT id FROM partner_inquiries WHERE idempotency_key = ? LIMIT 1`,
    args: [key],
  });
  return result.rows[0] as { id: string } | undefined;
}

export async function createInquiry(input: NewInquiry) {
  const results = await sqlite.batch([
    {
      sql: `INSERT INTO partner_inquiries
        (id, idempotency_key, name, organisation, email, message)
        SELECT ?, ?, ?, ?, ?, ?
        WHERE (SELECT COUNT(*) FROM partner_inquiries
               WHERE created_at >= datetime('now', '-1 hour')) < 20
          AND (SELECT COUNT(*) FROM partner_inquiries
               WHERE email = ?
                 AND created_at >= datetime('now', '-15 minutes')) < 2
        ON CONFLICT(idempotency_key) DO NOTHING`,
      args: [
        input.id,
        input.idempotencyKey,
        input.name,
        input.organisation,
        input.email,
        input.message,
        input.email,
      ],
    },
    {
      sql: `INSERT INTO partner_email_outbox
        (id, inquiry_id, kind, recipient)
        SELECT ?, id, 'confirmation', email
        FROM partner_inquiries WHERE id = ?`,
      args: [`${input.id}:confirmation`, input.id],
    },
    {
      sql: `INSERT INTO partner_email_outbox
        (id, inquiry_id, kind, recipient)
        SELECT ?, id, 'notification', 'mail@livingstoriescollective.org'
        FROM partner_inquiries WHERE id = ?`,
      args: [`${input.id}:notification`, input.id],
    },
  ], "write");

  return results[0].rowsAffected === 1;
}

const INQUIRY_SELECT = `
  SELECT
    i.*,
    COALESCE(MAX(CASE WHEN o.kind = 'confirmation' THEN o.state END), 'pending')
      AS confirmation_state,
    COALESCE(MAX(CASE WHEN o.kind = 'notification' THEN o.state END), 'pending')
      AS notification_state
  FROM partner_inquiries i
  LEFT JOIN partner_email_outbox o ON o.inquiry_id = i.id
`;

export async function listInquiries(limit = 100): Promise<Inquiry[]> {
  const result = await sqlite.execute({
    sql: `${INQUIRY_SELECT}
      GROUP BY i.id
      ORDER BY i.created_at DESC
      LIMIT ?`,
    args: [limit],
  });
  return result.rows as unknown as Inquiry[];
}

export async function getInquiry(id: string): Promise<Inquiry | undefined> {
  const result = await sqlite.execute({
    sql: `${INQUIRY_SELECT}
      WHERE i.id = ?
      GROUP BY i.id
      LIMIT 1`,
    args: [id],
  });
  return result.rows[0] as unknown as Inquiry | undefined;
}

export async function updateInquiry(
  id: string,
  status: InquiryStatus,
  notes: string,
) {
  await sqlite.execute({
    sql: `UPDATE partner_inquiries
          SET status = ?, notes = ?, updated_at = datetime('now')
          WHERE id = ?`,
    args: [status, notes, id],
  });
}

export async function listReadyEmailJobs(limit = 10): Promise<EmailJob[]> {
  const result = await sqlite.execute({
    sql: `SELECT
            o.id, o.inquiry_id, o.kind, o.recipient, o.state,
            o.attempt_count, o.last_error,
            json_object(
              'id', i.id,
              'idempotency_key', i.idempotency_key,
              'created_at', i.created_at,
              'updated_at', i.updated_at,
              'name', i.name,
              'organisation', i.organisation,
              'email', i.email,
              'message', i.message,
              'status', i.status,
              'notes', i.notes,
              'confirmation_state', 'pending',
              'notification_state', 'pending'
            ) AS inquiry_json
          FROM partner_email_outbox o
          JOIN partner_inquiries i ON i.id = o.inquiry_id
          WHERE o.state IN ('pending', 'failed')
            AND o.next_attempt_at <= datetime('now')
            AND o.attempt_count < 5
          ORDER BY o.created_at ASC
          LIMIT ?`,
    args: [limit],
  });

  return result.rows.map((row) => {
    const raw = row as Record<string, unknown> & { inquiry_json: string };
    const { inquiry_json, ...job } = raw;
    return { ...job, inquiry: JSON.parse(inquiry_json) } as EmailJob;
  });
}

export async function claimEmailJob(id: string) {
  const result = await sqlite.execute({
    sql: `UPDATE partner_email_outbox
          SET state = 'sending', attempt_count = attempt_count + 1,
              updated_at = datetime('now')
          WHERE id = ? AND state IN ('pending', 'failed')
            AND next_attempt_at <= datetime('now')
            AND attempt_count < 5
          RETURNING attempt_count`,
    args: [id],
  });
  const row = result.rows[0] as { attempt_count: number } | undefined;
  return row ? Number(row.attempt_count) : null;
}

export async function markEmailAccepted(id: string, attempt: number) {
  await sqlite.execute({
    sql: `UPDATE partner_email_outbox
          SET state = 'accepted', accepted_at = datetime('now'),
              last_error = NULL, updated_at = datetime('now')
          WHERE id = ? AND state = 'sending' AND attempt_count = ?`,
    args: [id, attempt],
  });
}

export async function markEmailFailed(id: string, attempt: number, error: string) {
  await sqlite.execute({
    sql: `UPDATE partner_email_outbox
          SET state = 'failed', last_error = ?,
              next_attempt_at = datetime('now', '+' || MIN(attempt_count * 5, 60) || ' minutes'),
              updated_at = datetime('now')
          WHERE id = ? AND state = 'sending' AND attempt_count = ?`,
    args: [error.slice(0, 500), id, attempt],
  });
}
