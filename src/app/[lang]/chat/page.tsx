import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AiChatPage } from "@/components/ai/ai-chat-page/AiChatPage";
import { getTours } from "@/utils/api/tours";
import { hasLocale } from "@/utils/i18n/config";
import { getDictionary } from "@/utils/i18n/dictionaries";
import { pageMetadata } from "@/utils/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/chat">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return pageMetadata({ locale: lang, path: "/chat", title: dict.meta.chatTitle, description: dict.meta.chatDescription, markdown: false });
}

export default async function ChatPage({ params }: PageProps<"/[lang]/chat">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const tours = (await getTours(lang)).map((tour) => ({ slug: tour.slug, title: tour.title, image: tour.image }));

  return (
    <Suspense>
      <AiChatPage tours={tours} />
    </Suspense>
  );
}
