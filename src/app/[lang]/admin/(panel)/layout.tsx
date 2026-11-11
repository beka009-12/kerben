import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell/AdminShell";
import { AdminToastProvider } from "@/components/admin/admin-toast/AdminToast";
import { loadAllRequests } from "@/utils/admin/requests-source";
import { requireAdmin } from "@/utils/admin/session";
import { siteConfig } from "@/config/site";
import { hasLocale } from "@/utils/i18n/config";

export const instant = false;

const COUNT_WAIT_MS = 2500;

async function countNewRequests(token: string): Promise<number> {
  const count = loadAllRequests(token)
    .then((list) => (Array.isArray(list) ? list.filter((item) => item.status === "new").length : 0))
    .catch(() => 0);
  const timeout = new Promise<number>((resolve) => setTimeout(() => resolve(0), COUNT_WAIT_MS));
  return Promise.race([count, timeout]);
}

async function AdminFrame({ params, children }: { params: Promise<{ lang: string }>; children: ReactNode }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const { admin, token } = await requireAdmin();
  const newRequests = await countNewRequests(token);
  return (
    <AdminToastProvider>
      <AdminShell admin={admin} lang={lang} siteUrl={`${siteConfig.url}/${lang}`} newRequests={newRequests}>
        {children}
      </AdminShell>
    </AdminToastProvider>
  );
}

function AdminSkeleton() {
  return <div className="page-skeleton" aria-busy="true" />;
}

export default function AdminLayout({ params, children }: LayoutProps<"/[lang]/admin">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <AdminFrame params={params}>{children}</AdminFrame>
    </Suspense>
  );
}
