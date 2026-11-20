import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/icon/Icon";
import { Logo } from "@/components/ui/logo/Logo";
import type { Locale } from "@/utils/i18n/config";
import type { Dictionary } from "@/utils/i18n/dictionaries";

const SUMMIT = { x: 352, y: 186 };

/**
 * Горизонтали вокруг вершины, как на топокарте. Формы детерминированы (синусы, без random),
 * поэтому разметка сервера и клиента совпадает и гидратация не ругается
 */
function contour(index: number): string {
  const radius = 26 + index * 30;
  const seed = 0.7 + index * 0.45;
  const steps = 64;
  const points: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    const wobble = 1 + 0.09 * Math.sin(3 * angle + seed) + 0.05 * Math.sin(5 * angle + seed * 1.7) + 0.03 * Math.sin(8 * angle - seed);
    const x = SUMMIT.x + radius * 1.3 * wobble * Math.cos(angle);
    const y = SUMMIT.y + radius * 0.82 * wobble * Math.sin(angle);
    points.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return `${points.join("")}Z`;
}

const CONTOURS = Array.from({ length: 10 }, (_, i) => contour(i));
/** Тропа подходит к вершине и обрывается, не дойдя до неё */
const TRAIL = "M26 438C78 400 64 350 126 336S212 306 232 268";
const TRAIL_END = { x: 232, y: 268 };

function TrailMap({ youAreHere }: { youAreHere: string }) {
  return (
    <svg className="not-found-map" viewBox="0 0 560 440" aria-hidden="true" focusable="false">
      <defs>
        {/* Края карты растворяются в фоне, а не обрезаются рамкой */}
        <radialGradient id="not-found-fade" cx="0.63" cy="0.42" r="0.62">
          <stop offset="0.55" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
        <mask id="not-found-contour-mask">
          <rect width="560" height="440" fill="url(#not-found-fade)" />
        </mask>
        <mask id="not-found-trail-mask">
          <path d={TRAIL} className="not-found-trail-reveal" pathLength={1} />
        </mask>
      </defs>
      <g mask="url(#not-found-contour-mask)">
        {CONTOURS.map((d, i) => (
          // Каждая четвёртая — утолщённая, как основные горизонтали на картах
          <path key={d} d={d} className={i % 4 === 3 ? "not-found-contour not-found-contour-index" : "not-found-contour"} />
        ))}
      </g>
      <path d={TRAIL} className="not-found-trail" mask="url(#not-found-trail-mask)" />
      <g className="not-found-summit">
        <path d={`M${SUMMIT.x} ${SUMMIT.y - 12}l10 17h-20Z`} />
        <text x={SUMMIT.x + 20} y={SUMMIT.y + 22} className="not-found-code">
          404
        </text>
      </g>
      <g className="not-found-end" transform={`translate(${TRAIL_END.x} ${TRAIL_END.y})`}>
        <path d="M-8 -8l16 16M8 -8l-16 16" className="not-found-cross" />
        <text x={-16} y={-14} textAnchor="end" className="not-found-here">
          {youAreHere}
        </text>
      </g>
    </svg>
  );
}

export function NotFoundScreen({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.notFound;
  const base = `/${locale}`;
  const ways: { href: string; label: string; icon: IconName }[] = [
    { href: base, label: dict.nav.home, icon: "home" },
    { href: `${base}/tours`, label: dict.nav.tours, icon: "route" },
    { href: `${base}/attractions`, label: dict.nav.attractions, icon: "landmark" },
    { href: `${base}/contact`, label: dict.nav.contact, icon: "phone" },
    { href: `${base}/chat`, label: dict.nav.chat, icon: "sparkles" },
  ];

  return (
    <section className="not-found">
      <div className="container not-found-top">
        <Link href={base} className="not-found-brand" aria-label={dict.a11y.home}>
          <Logo />
        </Link>
      </div>
      <div className="container not-found-inner">
        <div className="not-found-copy">
          <h1 className="not-found-title">{t.title}</h1>
          <p className="not-found-text">{t.text}</p>
          <nav aria-label={t.ways}>
            <ul className="not-found-ways">
              {ways.map((way) => (
                <li key={way.href}>
                  <Link href={way.href} className="not-found-way">
                    <span className="not-found-way-icon">
                      <Icon name={way.icon} size={18} />
                    </span>
                    {way.label}
                    <Icon name="arrowRight" size={18} className="not-found-way-arrow" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <TrailMap youAreHere={t.youAreHere} />
      </div>
    </section>
  );
}
