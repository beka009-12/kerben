import { Icon } from "@/components/ui/icon/Icon";
import "./rating.css";

export function Rating({
  value,
  count,
  light = false,
  stars = false,
}: {
  value: number;
  count?: string;
  light?: boolean;
  stars?: boolean;
}) {
  return (
    <span className={light ? "rating rating-light" : "rating"}>
      {stars ? (
        <span className="rating-stars" aria-hidden="true">
          {Array.from({ length: 5 }, (_, i) => (
            <Icon key={i} name="star" size={14} filled={i < Math.round(value)} className="rating-star" />
          ))}
        </span>
      ) : (
        <Icon name="star" size={14} filled className="rating-star" />
      )}
      <span className="rating-value">{value.toFixed(1)}</span>
      {count && <span className={light ? "rating-count rating-count-light" : "rating-count"}>({count})</span>}
    </span>
  );
}
