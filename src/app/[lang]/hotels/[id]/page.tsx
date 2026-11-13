import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BookingCard } from "@/components/common/booking-card/BookingCard";
import { DetailLayout } from "@/components/common/detail-layout/DetailLayout";
import { DetailSection } from "@/components/common/detail-section/DetailSection";
import { Icon } from "@/components/ui/icon/Icon";
import { getHotel, getHotels } from "@/utils/api/catalog";
import { bookingLabels, countField, dateField, getBookingExtras } from "@/utils/contact/booking-extras";
import { formatPrice } from "@/utils/format";
import { AMENITY_ICONS } from "@/utils/hotels/amenity-icons";
import { hasLocale } from "@/utils/i18n/config";
import { getDictionary } from "@/utils/i18n/dictionaries";
import { hotelItem } from "@/utils/listing-items";
import { alternates } from "@/utils/seo";
import "./hotel-page.css";

export async function generateStaticParams() {
  const hotels = await getHotels("ru");
  return [{ id: hotels[0]?.id ?? "0" }];
}

export async function generateMetadata({ params }: PageProps<"/[lang]/hotels/[id]">): Promise<Metadata> {
  const { lang, id } = await params;
  if (!hasLocale(lang)) return {};
  const hotel = await getHotel(lang, id);
  if (!hotel) return {};
  return {
    title: hotel.name,
    description: hotel.description || hotel.location,
    alternates: alternates(lang, `/hotels/${id}`),
    openGraph: { title: hotel.name, images: [{ url: hotel.image }] },
  };
}

export default function HotelPage({ params }: PageProps<"/[lang]/hotels/[id]">) {
  return (
    <Suspense fallback={<div className="hotel-page-skeleton" aria-busy="true" />}>
      <HotelContent params={params} />
    </Suspense>
  );
}

async function HotelContent({ params }: { params: PageProps<"/[lang]/hotels/[id]">["params"] }) {
  const { lang, id } = await params;
  if (!hasLocale(lang)) notFound();

  const [dict, hotels] = await Promise.all([getDictionary(lang), getHotels(lang)]);
  const hotel = hotels.find((h) => h.id === id);
  if (!hotel) notFound();

  const t = dict.hotels;
  const names = t.amenities as Record<string, string>;
  const place = hotel.location || hotel.address;
  const extras = await getBookingExtras(lang, dict, hotel.price, false);
  const mapHref = hotel.coords
    ? `https://www.google.com/maps/search/?api=1&query=${hotel.coords[1]},${hotel.coords[0]}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hotel.name} ${place}`)}`;

  return (
    <DetailLayout
      header={{
        title: hotel.name,
        kicker: t.tag,
        meta: place ? [{ icon: "mapPin", text: place }] : [],
        section: { href: `/${lang}/hotels`, label: dict.nav.hotels },
      }}
      images={[hotel.image, ...hotel.gallery]}
      aside={
        <BookingCard
          title={hotel.name}
          price={hotel.price > 0 ? formatPrice(hotel.price, lang) : null}
          fields={[dateField("checkIn", t.checkIn), dateField("checkOut", t.checkOut), countField("guests", t.guests, t.guestForms, lang)]}
          contacts={extras.contacts}
          chatHref={`/${lang}/chat`}
          askHref={`/${lang}/chat?ask=${encodeURIComponent(t.askPrompt.replace("{name}", hotel.name).replace("{place}", place))}`}
          labels={bookingLabels(dict, dict.units[hotel.unit] ?? t.perNight, { book: dict.offers.request, notes: true })}
        />
      }
      others={{
        title: t.other,
        link: { href: `/${lang}/hotels`, label: t.back },
        items: hotels
          .filter((h) => h.id !== hotel.id)
          .slice(0, 3)
          .map((item) => hotelItem(item, lang, dict)),
      }}
      locale={lang}
      dict={dict}
    >
      <DetailSection id="overview" title={t.about}>
        <p className="hotel-page-text">{hotel.description || t.aboutFallback}</p>
      </DetailSection>

      {hotel.amenities.length > 0 && (
        <DetailSection id="amenities" title={t.amenitiesTitle}>
          <ul className="hotel-page-amenities">
            {hotel.amenities.map((key) => (
              <li key={key} className="hotel-page-amenity">
                <Icon name={AMENITY_ICONS[key] ?? "check"} size={18} />
                {names[key] ?? key}
              </li>
            ))}
          </ul>
        </DetailSection>
      )}

      <DetailSection id="location" title={t.location}>
        <div className="hotel-page-location">
          {place && (
            <p className="hotel-page-address">
              <Icon name="mapPin" size={16} />
              {[hotel.address, hotel.location].filter(Boolean).join(" · ")}
            </p>
          )}
          <a href={mapHref} target="_blank" rel="noopener noreferrer" className="hotel-page-map-link">
            {t.openMap}
            <Icon name="arrowRight" size={18} />
          </a>
        </div>
      </DetailSection>
    </DetailLayout>
  );
}
