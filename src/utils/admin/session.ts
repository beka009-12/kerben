import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { adminMe, type AdminProfile } from "./api";

import { ADMIN_COOKIE } from "./tokens";

export { ADMIN_COOKIE };
export const ADMIN_LOGIN = "/ru/admin/login";
export const ADMIN_EXPIRED = `${ADMIN_LOGIN}?expired=1`;

export async function getAdminToken(): Promise<string | null> {
  return (await cookies()).get(ADMIN_COOKIE)?.value || null;
}

export const requireAdmin = cache(async (): Promise<{ admin: AdminProfile; token: string }> => {
  const token = await getAdminToken();
  const admin = token ? await adminMe(token) : null;
  if (!token) redirect(ADMIN_LOGIN);
  if (!admin) redirect(ADMIN_EXPIRED);
  if (admin === "unavailable") return { admin: { id: 0, username: "" }, token };
  return { admin, token };
});
