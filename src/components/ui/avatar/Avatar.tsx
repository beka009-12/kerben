import "./avatar.css";

export function Avatar({ size = "md" }: { id?: string; name?: string; size?: "sm" | "md" | "lg" }) {
  return (
    <span className={`avatar avatar-${size}`} aria-hidden="true">
      <svg viewBox="0 0 212 212" className="avatar-svg">
        <path
          fill="currentColor"
          d="M106 45c-19 0-34.5 15.6-34.5 34.7 0 19.1 15.5 34.7 34.5 34.7s34.5-15.6 34.5-34.7C140.5 60.6 125 45 106 45Zm0 85.6c-33.4 0-61.3 18-67.6 41.9A105.5 105.5 0 0 0 106 212a105.5 105.5 0 0 0 67.6-39.5c-6.3-23.9-34.2-41.9-67.6-41.9Z"
        />
      </svg>
    </span>
  );
}
