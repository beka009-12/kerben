import Link from "next/link";
import { FaqList } from "@/components/faq/faq-list/FaqList";
import { HOME_FAQ_LIMIT, type FaqItem } from "@/utils/home/faq";
import { Icon } from "@/components/ui/icon/Icon";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import "./faq.css";

export function Faq({ locale, dict, items }: { locale: Locale; dict: Dictionary; items?: FaqItem[] }) {
  const t = dict.home.faq;
  const questions = items && items.length > 0 ? items : t.items;
  return (
    <section id="faq" className="faq" aria-labelledby="faq-title">
      <div className="container faq-inner">
        <div className="faq-head">
          <p className="faq-kicker">{t.kicker}</p>
          <h2 id="faq-title" className="faq-title">
            {t.title}
          </h2>
          <div className="faq-actions">
            <Link href={`/${locale}/faq`} className="faq-all">
              {t.all}
              <span className="faq-count">{questions.length}</span>
              <Icon name="arrowRight" size={18} />
            </Link>
            <Link href={`/${locale}/chat`} className="faq-more">
              <Icon name="chat" size={18} />
              {t.more}
            </Link>
          </div>
        </div>
        <FaqList items={questions.slice(0, HOME_FAQ_LIMIT)} />
      </div>
    </section>
  );
}
