import { DestinationCard } from "@/components/home/destination-card/DestinationCard";
import { SectionHeader } from "@/components/ui/section-header/SectionHeader";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import type { Tour } from "@/types/tour";
import "./popular-destinations.css";

export function PopularDestinations({ tours, locale, dict }: { tours: Tour[]; locale: Locale; dict: Dictionary }) {
  return (
    <section className="section" aria-labelledby="popular-title">
      <div className="container">
        <SectionHeader
          id="popular-title"
          title={dict.popular.title}
          link={{ href: `/${locale}/destinations`, label: dict.popular.viewAll }}
        />
        <ul className="popular-destinations-list">
          {tours.map((tour) => (
            <li key={tour.slug} className="popular-destinations-item">
              <DestinationCard tour={tour} locale={locale} fromLabel={dict.card.from} daysLabel={dict.card.days} perLabel={dict.card.perPerson}
                categoryLabel={tour.categoryName ?? dict.categories.items[tour.category]?.title}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
