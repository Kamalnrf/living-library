/** @jsxImportSource npm:hono@4/jsx */
import type { Inquiry, InquiryStatus } from "./db.ts";

const STATUS_LABELS: Record<InquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  in_progress: "In progress",
  closed: "Closed",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
    timeZoneName: "short",
  }).format(new Date(`${value.replace(" ", "T")}Z`));
}

function DeliveryState({ state, label }: { state: string; label: string }) {
  return (
    <span class={`delivery delivery--${state}`}>
      <span aria-hidden="true" class="delivery__dot" />
      {label}: {state}
    </span>
  );
}

function InquiryCard({ inquiry }: { inquiry: Inquiry }) {
  return (
    <article class="inquiry-card">
      <header class="inquiry-card__header">
        <div>
          <p class="eyebrow">{formatDate(inquiry.created_at)}</p>
          <h2>{inquiry.organisation}</h2>
          <p class="contact-line">
            {inquiry.name} · <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
          </p>
        </div>
        <span class={`status status--${inquiry.status}`}>
          {STATUS_LABELS[inquiry.status]}
        </span>
      </header>

      <p class="message">{inquiry.message}</p>

      <div class="delivery-row" aria-label="Email delivery status">
        <DeliveryState state={inquiry.confirmation_state} label="Confirmation" />
        <DeliveryState state={inquiry.notification_state} label="Team alert" />
      </div>

      <details class="follow-up" open={Boolean(inquiry.notes)}>
        <summary>Follow-up and private notes</summary>
        <form method="post" action={`/dashboard/inquiries/${inquiry.id}`}>
          <div class="field-row">
            <label>
              <span>Status</span>
              <select name="status">
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option value={value} selected={inquiry.status === value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label class="notes-field">
              <span>Notes</span>
              <textarea
                name="notes"
                rows={3}
                maxlength={2000}
                placeholder="Add context for the team…"
              >
                {inquiry.notes}
              </textarea>
            </label>
          </div>
          <button type="submit">Save update</button>
        </form>
      </details>
    </article>
  );
}

export function DashboardPage({
  inquiries,
  userEmail,
  saved,
}: {
  inquiries: Inquiry[];
  userEmail: string;
  saved: boolean;
}) {
  const openCount = inquiries.filter((item) => item.status !== "closed").length;

  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light" />
        <meta name="robots" content="noindex, nofollow" />
        <title>Partner inquiries · Living Stories Collective</title>
        <style>{styles}</style>
      </head>
      <body>
        <header class="site-header">
          <a class="brand" href="/dashboard" aria-label="Living Stories Collective inquiries">
            <span class="brand__mark" aria-hidden="true">LS</span>
            <span>
              <strong>Living Stories Collective</strong>
              <small>Partner inquiries</small>
            </span>
          </a>
          <div class="account">
            <span>{userEmail}</span>
            <form method="post" action="/auth/logout">
              <button type="submit">Sign out</button>
            </form>
          </div>
        </header>

        <main>
          {saved && (
            <p class="toast" role="status">Inquiry updated.</p>
          )}
          <section class="intro" aria-labelledby="page-title">
            <div>
              <p class="eyebrow">Partner desk</p>
              <h1 id="page-title">Inquiries</h1>
              <p>New conversations and follow-up notes in one quiet place.</p>
            </div>
            <dl class="summary">
              <div><dt>Open</dt><dd>{openCount}</dd></div>
              <div><dt>Total</dt><dd>{inquiries.length}</dd></div>
            </dl>
          </section>

          <section class="inquiry-list" aria-label="Partner inquiries">
            {inquiries.length ? (
              inquiries.map((inquiry) => <InquiryCard inquiry={inquiry} />)
            ) : (
              <div class="empty-state">
                <p class="eyebrow">All clear</p>
                <h2>No inquiries yet</h2>
                <p>New partner submissions will appear here.</p>
              </div>
            )}
          </section>
        </main>
      </body>
    </html>
  );
}

export function AccessDeniedPage({ email }: { email: string }) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
        <title>Access denied · Living Stories Collective</title>
        <style>{styles}</style>
      </head>
      <body class="centred-page">
        <main class="access-card">
          <p class="eyebrow">Partner desk</p>
          <h1>Access isn’t enabled</h1>
          <p>
            <strong>{email}</strong> is signed in, but is not on the dashboard allowlist.
          </p>
          <form method="post" action="/auth/logout">
            <button class="button-link" type="submit">Sign in with another account</button>
          </form>
        </main>
      </body>
    </html>
  );
}

const styles = String.raw`
  :root {
    color: #25251f;
    background: #f2efe7;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-synthesis: none;
  }
  * { box-sizing: border-box; }
  body { margin: 0; min-width: 320px; background: #f2efe7; }
  a { color: inherit; text-underline-offset: 3px; }
  button, select, textarea { font: inherit; }
  .site-header {
    min-height: 72px; padding: 12px clamp(18px, 4vw, 48px); display: flex;
    align-items: center; justify-content: space-between; gap: 24px;
    border-bottom: 1px solid #d8d3c7; background: rgba(248, 246, 240, .92);
  }
  .brand { display: inline-flex; align-items: center; gap: 12px; text-decoration: none; }
  .brand__mark {
    width: 42px; height: 42px; display: grid; place-items: center; border-radius: 50%;
    color: #f8f6f0; background: #38372f; font-family: Georgia, serif; font-size: 14px;
  }
  .brand strong, .brand small { display: block; }
  .brand strong { font-family: Georgia, serif; font-size: 16px; font-weight: 500; }
  .brand small { margin-top: 2px; color: #777266; font-size: 12px; }
  .account { display: flex; align-items: center; gap: 16px; color: #69655b; font-size: 13px; }
  .account form { margin: 0; }
  .account button {
    min-height: 44px; padding: 0; border: 0; background: transparent; color: inherit;
    text-decoration: underline; text-underline-offset: 3px; cursor: pointer;
  }
  main { width: min(1080px, calc(100% - 36px)); margin: 0 auto; padding: 56px 0 80px; }
  .intro { display: flex; align-items: flex-end; justify-content: space-between; gap: 32px; margin-bottom: 34px; }
  .eyebrow {
    margin: 0 0 8px; color: #817b6d; font-size: 11px; font-weight: 650;
    letter-spacing: .12em; line-height: 1.4; text-transform: uppercase;
  }
  h1, h2 { margin: 0; font-family: Georgia, "Times New Roman", serif; font-weight: 400; }
  h1 { font-size: clamp(42px, 7vw, 68px); letter-spacing: -.04em; line-height: .98; }
  .intro > div > p:last-child { max-width: 510px; margin: 14px 0 0; color: #68645a; font-size: 16px; line-height: 1.55; }
  .summary { display: flex; gap: 8px; margin: 0; }
  .summary div { min-width: 86px; padding: 12px 14px; border: 1px solid #d8d3c7; background: #f8f6f0; }
  .summary dt { color: #777266; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; }
  .summary dd { margin: 6px 0 0; font-family: Georgia, serif; font-size: 28px; font-variant-numeric: tabular-nums; }
  .inquiry-list { display: grid; gap: 14px; }
  .inquiry-card { padding: clamp(20px, 4vw, 32px); border: 1px solid #d8d3c7; background: #fbfaf6; box-shadow: 0 10px 30px rgba(61, 57, 47, .04); }
  .inquiry-card__header { display: flex; justify-content: space-between; gap: 24px; }
  .inquiry-card h2 { font-size: clamp(25px, 4vw, 34px); line-height: 1.1; }
  .contact-line { margin: 8px 0 0; color: #68645a; font-size: 14px; line-height: 1.5; }
  .status { align-self: flex-start; padding: 7px 10px; border-radius: 999px; font-size: 12px; white-space: nowrap; }
  .status--new { color: #254d3b; background: #dcebe3; }
  .status--contacted { color: #604519; background: #f3e4bd; }
  .status--in_progress { color: #334b66; background: #dce7f0; }
  .status--closed { color: #68645a; background: #e8e5de; }
  .message { margin: 24px 0; max-width: 780px; white-space: pre-wrap; font-family: Georgia, serif; font-size: 18px; line-height: 1.65; }
  .delivery-row { display: flex; flex-wrap: wrap; gap: 12px; padding-top: 16px; border-top: 1px solid #ebe7de; }
  .delivery { display: inline-flex; align-items: center; gap: 7px; color: #777266; font-size: 12px; }
  .delivery__dot { width: 7px; height: 7px; border-radius: 50%; background: #b1aca0; }
  .delivery--accepted .delivery__dot { background: #4a7b62; }
  .delivery--failed .delivery__dot { background: #a34d42; }
  .delivery--sending .delivery__dot { background: #b68a31; }
  .follow-up { margin-top: 20px; border-top: 1px solid #ebe7de; }
  .follow-up summary { min-height: 48px; display: flex; align-items: center; color: #615d53; font-size: 14px; cursor: pointer; }
  .follow-up summary::marker { color: #8a8477; }
  .follow-up form { padding-top: 6px; }
  .field-row { display: grid; grid-template-columns: 180px minmax(0, 1fr); gap: 16px; }
  label span { display: block; margin-bottom: 7px; color: #777266; font-size: 12px; }
  select, textarea { width: 100%; border: 1px solid #cfc9bc; border-radius: 0; background: #fff; color: #25251f; font-size: 16px; }
  select { min-height: 46px; padding: 0 12px; }
  textarea { min-height: 96px; padding: 11px 12px; line-height: 1.5; resize: vertical; }
  select:focus, textarea:focus, button:focus-visible, a:focus-visible { outline: 2px solid #435d4f; outline-offset: 3px; }
  .follow-up button, .button-link {
    min-height: 44px; margin-top: 14px; padding: 0 17px; display: inline-flex; align-items: center;
    justify-content: center; border: 1px solid #35342e; background: #35342e; color: #fff;
    font-size: 14px; text-decoration: none; cursor: pointer;
  }
  .toast { padding: 12px 14px; border: 1px solid #b9d2c2; background: #e5f0e9; color: #254d3b; }
  .empty-state, .access-card { padding: clamp(28px, 6vw, 56px); border: 1px solid #d8d3c7; background: #fbfaf6; text-align: center; }
  .empty-state h2, .access-card h1 { font-size: clamp(30px, 5vw, 48px); }
  .empty-state > p:last-child, .access-card p { color: #68645a; line-height: 1.6; }
  .centred-page { min-height: 100vh; display: grid; place-items: center; padding: 20px; }
  .centred-page main { width: min(620px, 100%); margin: 0; padding: 0; }
  @media (hover: hover) {
    .follow-up button:hover, .button-link:hover { background: #4a4940; }
  }
  @media (max-width: 700px) {
    .site-header { align-items: flex-start; }
    .brand strong { max-width: 170px; }
    .account { align-items: flex-end; flex-direction: column; gap: 2px; text-align: right; }
    main { width: min(100% - 28px, 1080px); padding-top: 38px; }
    .intro { align-items: flex-start; flex-direction: column; gap: 22px; }
    .summary { width: 100%; }
    .summary div { flex: 1; }
    .inquiry-card__header { flex-direction: column; gap: 14px; }
    .field-row { grid-template-columns: 1fr; }
    .follow-up button { width: 100%; }
  }
`;
