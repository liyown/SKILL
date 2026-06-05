"use server";

import { db } from "@/lib/db";

export async function updateUser(formData: FormData) {
  const userId = String(formData.get("userId"));
  const role = String(formData.get("role"));
  await db.user.update({ where: { id: userId }, data: { role } });
}
