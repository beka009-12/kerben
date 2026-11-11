import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./button.css";

type Variant = "primary" | "outline" | "ghost" | "light" | "dark";
type Size = "sm" | "md" | "lg";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  children: ReactNode;
  className?: string;
}

function classes({ variant = "primary", size = "md", block, className }: Omit<CommonProps, "children">) {
  return ["button", `button-${variant}`, `button-${size}`, block ? "button-block" : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
}

export function Button({
  variant,
  size,
  block,
  className,
  children,
  type = "button",
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={classes({ variant, size, block, className })} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant,
  size,
  block,
  className,
  children,
  ...rest
}: CommonProps & { href: string; "aria-label"?: string; onNavigate?: () => void }) {
  return (
    <Link href={href} className={classes({ variant, size, block, className })} {...rest}>
      {children}
    </Link>
  );
}
