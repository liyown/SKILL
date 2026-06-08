"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

/**
 * Good counterpart of {@code nextjs-server-action.ts}.
 */
const updateSchema = z.object({
  role: z.enum(["member", "admin", "owner"]),
});

export async function updateUser(formData: FormData) {
  // Fix 1 (server-side identity): the actor comes from the server
  // session, not from the form payload. The bad version trusted
  // `formData.get("userId")` and let an attacker update any user.
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("not authenticated");
  }

  const actor = await db.user.findUnique({ where: { id: session.user.id } });
  if (!actor) {
    throw new Error("actor not found");
  }
  // Fix 2 (authorization): explicit role check before the write. UI
  // hiding is not a substitute for server-side checks.
  if (actor.role !== "admin" && actor.role !== "owner") {
    throw new Error("forbidden");
  }

  const targetId = String(formData.get("userId") ?? "");
  if (!targetId) {
    throw new Error("userId is required");
  }

  // Fix 3 (existence check): load the target before mutating so a
  // non-existent id is reported as not_found rather than triggering
  // a constraint violation in the database driver.
  const target = await db.user.findUnique({ where: { id: targetId } });
  if (!target) {
    throw new Error("target not found");
  }

  // Fix 4 (schema validation): zod parse rejects unknown role values
  // before they reach the database. The bad version passed the
  // form value straight into `data: { role }`.
  const parsed = updateSchema.parse({ role: formData.get("role") });
  if (parsed.role === "owner" && actor.role !== "owner") {
    throw new Error("only owners can grant owner");
  }

  await db.user.update({ where: { id: targetId }, data: { role: parsed.role } });
  // Fix 5 (cache invalidation): revalidatePath so the cached admin
  // page reflects the new role on the next request.
  revalidatePath(`/admin/users/${targetId}`);
}
