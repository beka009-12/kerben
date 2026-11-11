"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { Button } from "@/components/ui/button/Button";
import { Icon } from "@/components/ui/icon/Icon";
import { Rating } from "@/components/ui/rating/Rating";
import { formatNumber, plural } from "@/utils/format";
import { REVIEW_FILTERS, REVIEW_MAX_LENGTH, useTourReviews, type ReviewFilter } from "@/utils/tour/use-tour-reviews";
import "./tour-reviews.css";

export function TourReviews({ tourSlug }: { tourSlug: string }) {
  const {
    locale, dict, t, uid, status, user, reviews, loadError, rating, setRating, body, setBody, formError, sending, count, average, mine, dateFormat, submit, remove,
    filter, choose, counts, shown, hiddenCount, expanded, setExpanded, canCollapse,
  } = useTourReviews({ tourSlug });
  const filterNames: Record<ReviewFilter, string> = { all: t.filterAll, good: t.filterGood, bad: t.filterBad };

  return (
    <section id="reviews" className="tour-reviews" aria-labelledby="reviews-title">
      <div className="tour-reviews-head">
        <h2 id="reviews-title" className="tour-reviews-title">
          {dict.tour.reviewsTitle}
        </h2>
        {count > 0 && (
          <span className="tour-reviews-summary">
            <Rating value={average} stars />
            <span className="tour-reviews-based">{dict.tour.basedOn.replace("{n}", formatNumber(count, locale)).replace("{reviews}", plural(count, locale, dict.tour.basedOnForms))}</span>
          </span>
        )}
      </div>

      {loadError && (
        <p className="tour-reviews-note" role="alert">
          {t.loadError}
        </p>
      )}

      {reviews !== null && count === 0 && !loadError && <p className="tour-reviews-note">{t.empty}</p>}

      {count > 0 && (
        <div className="tour-reviews-filters" role="group" aria-label={t.filterLabel}>
          {REVIEW_FILTERS.map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={filter === key}
              className={filter === key ? "tour-reviews-filter tour-reviews-filter-on" : "tour-reviews-filter"}
              onClick={() => choose(key)}
            >
              {key !== "all" && <Icon name="star" size={14} filled />}
              {filterNames[key]}
              <span className="tour-reviews-filter-count">{formatNumber(counts[key], locale)}</span>
            </button>
          ))}
        </div>
      )}

      {count > 0 && shown.length === 0 && <p className="tour-reviews-note">{t.filterEmpty}</p>}

      {shown.length > 0 && (
        <ul id={`${uid}-list`} className="tour-reviews-list">
          {shown.map((review) => (
            <li key={review.id} className="tour-reviews-card">
              <div className="tour-reviews-person">
                <Avatar size="md" />
                <span className="tour-reviews-who">
                  <strong className="tour-reviews-name">
                    {review.user_id === user?.id ? t.you : (review.profiles?.name ?? "—")}
                  </strong>
                  <span className="tour-reviews-from">{dateFormat.format(new Date(review.created_at))}</span>
                </span>
                {review.user_id === user?.id && (
                  <button
                    type="button"
                    className="tour-reviews-remove"
                    onClick={() => void remove(review.id)}
                    aria-label={t.remove}
                    title={t.remove}
                  >
                    <Icon name="trash" size={16} />
                  </button>
                )}
              </div>
              <Rating value={review.rating} stars />
              <p className="tour-reviews-text">{review.body}</p>
            </li>
          ))}
        </ul>
      )}

      {(hiddenCount > 0 || canCollapse) && (
        <button type="button" className="tour-reviews-more" aria-expanded={expanded} aria-controls={`${uid}-list`} onClick={() => setExpanded(!expanded)}>
          {expanded ? t.showLess : t.showAll.replace("{n}", formatNumber(hiddenCount + shown.length, locale))}
          <Icon name={expanded ? "chevronUp" : "chevronDown"} size={18} />
        </button>
      )}

      {status === "guest" && (
        <p className="tour-reviews-login">
          {t.login}
          <Link href={`/${locale}/chat?next=${encodeURIComponent(`/tours/${tourSlug}`)}`} className="tour-reviews-login-link">
            {t.loginCta}
            <Icon name="arrowRight" size={14} />
          </Link>
        </p>
      )}

      {status === "user" && !mine && reviews !== null && (
        <form className="tour-reviews-form" onSubmit={submit} noValidate>
          <h3 className="tour-reviews-form-title">{t.write}</h3>
          <fieldset className="tour-reviews-stars">
            <legend className="tour-reviews-label">{t.rating}</legend>
            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n} className="tour-reviews-star" title={t.star.replace("{n}", String(n))}>
                <input
                  type="radio"
                  name={`${uid}-rating`}
                  value={n}
                  checked={rating === n}
                  onChange={() => setRating(n)}
                  className="visually-hidden"
                />
                <Icon
                  name="star"
                  size={28}
                  filled={n <= rating}
                  className={n <= rating ? "tour-reviews-star-on" : "tour-reviews-star-off"}
                />
                <span className="visually-hidden">{t.star.replace("{n}", String(n))}</span>
              </label>
            ))}
          </fieldset>
          <textarea
            className="tour-reviews-input"
            rows={4}
            maxLength={REVIEW_MAX_LENGTH}
            value={body}
            placeholder={t.placeholder}
            aria-label={t.write}
            onChange={(event) => setBody(event.target.value)}
          />
          {formError && (
            <p className="tour-reviews-error" role="alert">
              {formError}
            </p>
          )}
          <Button type="submit" disabled={sending}>
            {sending ? t.sending : t.submit}
          </Button>
        </form>
      )}
    </section>
  );
}
