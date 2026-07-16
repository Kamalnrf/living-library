import { initDb } from "./db.ts";
import { deliverReadyEmails } from "./delivery.ts";

export default async function () {
  await initDb();
  await deliverReadyEmails(20);
}
