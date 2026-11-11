import { AdminLogin } from "@/components/admin/admin-login/AdminLogin";

export default async function AdminLoginPage({ params }: PageProps<"/[lang]/admin/login">) {
  const { lang } = await params;
  return <AdminLogin lang={lang} />;
}
