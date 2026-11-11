import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminScreen } from "@/components/admin/admin-screen/AdminScreen";

export const metadata: Metadata = {
  title: { absolute: "Админка — Kerben Travel" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <AdminScreen>{children}</AdminScreen>;
}
