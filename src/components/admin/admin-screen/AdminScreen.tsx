"use client";

import type { ReactNode } from "react";
import { useAdminChrome } from "@/utils/store/header";
import "./admin-screen.css";

export function AdminScreen({ children }: { children: ReactNode }) {
  useAdminChrome();
  return <div className="admin-screen">{children}</div>;
}
