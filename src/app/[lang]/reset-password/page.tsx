import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResetPassword } from "@/components/auth/reset-password/ResetPassword";
import { hasLocale } from "@/utils/i18n/config";
import { getDictionary } from "@/utils/i18n/dictionaries";

export async function generateMetadata({ params }: PageProps<"/[lang]/reset-password">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.login.newPasswordTitle, robots: { index: false, follow: false } };
}

export default async function ResetPasswordPage({ params }: PageProps<"/[lang]/reset-password">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return <ResetPassword />;
}
