/** @jsxImportSource npm:hono@4/jsx */
import { Hono } from "npm:hono@4";
import {
  getOAuthUserData,
  oauthMiddleware,
} from "https://esm.town/v/std/oauth/middleware.ts";
import {
  createInquiry,
  findInquiryByIdempotencyKey,
  initDb,
  INQUIRY_STATUSES,
  listInquiries,
  updateInquiry,
  type InquiryStatus,
} from "./db.ts";
import { AccessDeniedPage, DashboardPage } from "./dashboard.tsx";
import { deliverReadyEmails } from "./delivery.ts";

const DEFAULT_ALLOWED_EMAILS = [
  "kamalnrf@gmail.com",
  "mail@livingstoriescollective.org",
];
const ALLOWED_ORIGINS = new Set([
  "https://livingstoriescollective.org",
  "https://www.livingstoriescollective.org",
  "http://localhost:4321",
]);
const VERCEL_PREVIEW_ORIGIN = /^https:\/\/living-library(?:-[a-z0-9]+)*\.vercel\.app$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

await initDb();

const app = new Hono();
app.onError((error, c) => {
  console.error("Partner inquiries error", error instanceof Error ? error.message : error);
  applyCors(c);
  return c.json({ error: "Something went wrong." }, 500);
});

app.use("*", async (c, next) => {
  if (!c.req.path.startsWith("/api/")) {
    c.header("Access-Control-Allow-Origin", new URL(c.req.url).origin);
  }
  await next();
});

function allowedDashboardEmails() {
  const configured = Deno.env.get("DASHBOARD_ALLOWED_EMAILS");
  return new Set(
    (configured ? configured.split(",") : DEFAULT_ALLOWED_EMAILS)
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  );
}

function html(node: unknown, status = 200) {
  return new Response(`<!doctype html>${String(node)}`, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "content-security-policy":
        "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
      "referrer-policy": "no-referrer",
      "x-content-type-options": "nosniff",
    },
  });
}

async function requireDashboardUser(c: any, next: any) {
  const session = await getOAuthUserData(c.req.raw);
  if (!session?.user) return c.redirect("/auth/login");

  const userEmail = session.user.email?.trim().toLowerCase() ?? "";
  if (!allowedDashboardEmails().has(userEmail)) {
    return html(<AccessDeniedPage email={userEmail || "Unknown email"} />, 403);
  }

  c.set("userEmail", userEmail);
  await next();
}

function applyCors(c: any) {
  const origin = c.req.header("origin");
  if (origin && isAllowedOrigin(origin)) {
    c.header("Access-Control-Allow-Origin", origin);
    c.header("Access-Control-Allow-Methods", "POST, OPTIONS");
    c.header("Access-Control-Allow-Headers", "Content-Type");
    c.header("Vary", "Origin");
  }
}

function isAllowedOrigin(origin: string) {
  return ALLOWED_ORIGINS.has(origin) || VERCEL_PREVIEW_ORIGIN.test(origin);
}

function acceptedResponse(c: any, inquiryId: string, nativeForm: boolean) {
  if (!nativeForm) return c.json({ ok: true, inquiryId }, 202);

  c.header(
    "Content-Security-Policy",
    "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",
  );
  return c.html(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Inquiry received · Living Stories Collective</title>
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; box-sizing: border-box; background: #f2efe7; color: #25251f; font-family: ui-sans-serif, system-ui, sans-serif; }
      main { width: min(560px, 100%); padding: clamp(28px, 7vw, 56px); box-sizing: border-box; border: 1px solid #d8d3c7; background: #fbfaf6; }
      h1 { margin: 0; font-family: Georgia, serif; font-size: clamp(36px, 8vw, 58px); font-weight: 400; line-height: 1; }
      p { margin: 20px 0 0; color: #68645a; font-size: 17px; line-height: 1.6; }
      a { display: inline-flex; min-height: 44px; align-items: center; margin-top: 24px; color: #25251f; text-underline-offset: 4px; }
    </style>
  </head>
  <body><main><h1>Thank you.</h1><p>Your inquiry has been received. We’ll email you a confirmation shortly.</p><a href="https://livingstoriescollective.org/partner-with-us/">Return to the website</a></main></body>
</html>`, 202);
}

async function readBodyWithinLimit(request: Request, limit: number) {
  const reader = request.body?.getReader();
  if (!reader) return "";

  const decoder = new TextDecoder();
  let byteLength = 0;
  let body = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    byteLength += value.byteLength;
    if (byteLength > limit) {
      await reader.cancel();
      return null;
    }
    body += decoder.decode(value, { stream: true });
  }

  return body + decoder.decode();
}

app.options("/api/inquiries", (c) => {
  applyCors(c);
  const origin = c.req.header("origin");
  return isAllowedOrigin(origin ?? "") ? c.body(null, 204) : c.body(null, 403);
});

app.post("/api/inquiries", async (c) => {
  applyCors(c);
  const origin = c.req.header("origin") ?? "";
  if (!isAllowedOrigin(origin)) {
    return c.json({ error: "This submission origin is not allowed." }, 403);
  }

  const contentLength = Number(c.req.header("content-length") ?? 0);
  if (contentLength > 20_000) {
    return c.json({ error: "The submission is too large." }, 413);
  }

  const contentType = (c.req.header("content-type") ?? "")
    .split(";", 1)[0]
    .trim()
    .toLowerCase();
  const nativeForm = contentType === "application/x-www-form-urlencoded";
  let body: Record<string, unknown>;
  try {
    const rawBody = await readBodyWithinLimit(c.req.raw, 20_000);
    if (rawBody === null) {
      return c.json({ error: "The submission is too large." }, 413);
    }
    if (nativeForm) {
      body = Object.fromEntries(new URLSearchParams(rawBody));
    } else {
      const parsed = JSON.parse(rawBody);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new TypeError("Expected a JSON object");
      }
      body = parsed;
    }
  } catch {
    return c.json({ error: "Expected a JSON submission." }, 415);
  }

  const name = String(body.name ?? "").trim();
  const organisation = String(body.organisation ?? "").trim();
  const submittedEmail = String(body.email ?? "").trim().toLowerCase();
  const message = String(body.message ?? "").trim();
  const suppliedIdempotencyKey = String(body.idempotencyKey ?? "").trim();
  const idempotencyKey = suppliedIdempotencyKey || (nativeForm ? crypto.randomUUID() : "");
  const honeypot = String(body.faxNumber ?? body.website ?? "").trim();

  if (honeypot) {
    return c.json({ ok: true }, 202);
  }
  if (
    !name || name.length > 120 ||
    !organisation || organisation.length > 160 ||
    !EMAIL_PATTERN.test(submittedEmail) || submittedEmail.length > 254 ||
    !message || message.length > 5000 ||
    !/^[0-9a-f-]{36}$/i.test(idempotencyKey)
  ) {
    return c.json({ error: "Please check the form fields and try again." }, 400);
  }

  const existing = await findInquiryByIdempotencyKey(idempotencyKey);
  if (existing) {
    return acceptedResponse(c, existing.id, nativeForm);
  }

  const inquiryId = crypto.randomUUID();
  const created = await createInquiry({
    id: inquiryId,
    idempotencyKey,
    name,
    organisation,
    email: submittedEmail,
    message,
  });

  if (!created) {
    const concurrentlyCreated = await findInquiryByIdempotencyKey(idempotencyKey);
    if (concurrentlyCreated) {
      return c.json({ ok: true, inquiryId: concurrentlyCreated.id }, 202);
    }
    return c.json(
      { error: "We’ve received several inquiries recently. Please try again later." },
      429,
    );
  }

  try {
    await deliverReadyEmails(2);
  } catch (error) {
    console.error("Immediate delivery attempt failed; cron will retry", error);
  }
  return acceptedResponse(c, inquiryId, nativeForm);
});

app.get("/", (c) => c.redirect("/dashboard"));

app.get("/dashboard", requireDashboardUser, async (c) => {
  const inquiries = await listInquiries();
  return html(
    <DashboardPage
      inquiries={inquiries}
      userEmail={c.get("userEmail")}
      saved={c.req.query("saved") === "1"}
    />,
  );
});

app.post("/dashboard/inquiries/:id", requireDashboardUser, async (c) => {
  const expectedOrigin = new URL(c.req.url).origin;
  if (c.req.header("origin") !== expectedOrigin) return c.text("Forbidden", 403);

  const form = await c.req.formData();
  const status = String(form.get("status") ?? "") as InquiryStatus;
  const notes = String(form.get("notes") ?? "").trim();
  if (!INQUIRY_STATUSES.includes(status) || notes.length > 2000) {
    return c.text("Invalid update", 400);
  }

  await updateInquiry(c.req.param("id"), status, notes);
  return c.redirect("/dashboard?saved=1", 303);
});

export default oauthMiddleware(app.fetch);
