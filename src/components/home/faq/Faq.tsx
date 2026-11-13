import Link from "next/link";
import { FaqList } from "@/components/faq/faq-list/FaqList";
import { Icon } from "@/components/ui/icon/Icon";
import { HOME_FAQ_LIMIT, type FaqItem } from "@/utils/home/faq";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import "./faq.css";

export function Faq({ locale, dict, items, soft = false }: { locale: Locale; dict: Dictionary; items?: FaqItem[]; soft?: boolean }) {
  const t = dict.home.faq;
  const questions = items && items.length > 0 ? items : t.items;
  return (
    <section id="faq" className={soft ? "faq faq-soft" : "faq"} aria-labelledby="faq-title">
      <div className="container faq-inner">
        <div className="faq-head">
          <p className="faq-kicker">{t.kicker}</p>
          <h2 id="faq-title" className="faq-title">
            {t.title}
          </h2>
          <Link href={`/${locale}/faq`} className="faq-all">
            {t.all}
            <span className="faq-count">{questions.length}</span>
          </Link>
          <Link href={`/${locale}/chat`} className="faq-ask">
            <Icon name="sparkle" size={18} />
            {t.more}
          </Link>
        </div>
        <FaqList items={questions.slice(0, HOME_FAQ_LIMIT)} openFirst />
      </div>
    </section>
  );
}
