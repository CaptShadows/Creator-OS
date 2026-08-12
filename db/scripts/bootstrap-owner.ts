import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { closeDatabase, getDatabase } from "../client";
import { auditEvents, users } from "../schema";
import { hashPassword } from "../../lib/auth/password";

const email = process.env.OWNER_EMAIL?.trim().toLowerCase();
const displayName = process.env.OWNER_DISPLAY_NAME?.trim();
const password = process.env.OWNER_PASSWORD;

if (!email || !displayName || !password) {
  throw new Error("OWNER_EMAIL, OWNER_DISPLAY_NAME, and OWNER_PASSWORD are required");
}

try {
  const [existing] = await getDatabase().db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) throw new Error("An owner with this email already exists");

  const ownerId = randomUUID();
  await getDatabase().db.transaction(async (tx) => {
    await tx.insert(users).values({ id: ownerId, email, displayName, passwordHash: await hashPassword(password) });
    await tx.insert(auditEvents).values({ id: randomUUID(), actorUserId: ownerId, eventType: "owner.bootstrap" });
  });
  console.log(`Owner bootstrapped for ${email}.`);
} finally {
  await closeDatabase();
}
