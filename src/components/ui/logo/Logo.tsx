import Image from "next/image";
import logo from "@/assets/brand/logo-full.png";
import logoLight from "@/assets/brand/logo-full-light.png";
import "./logo.css";

export function Logo({ light = false, size = "md" }: { light?: boolean; size?: "md" | "lg" }) {
  const large = size === "lg";
  const height = large ? 60 : 46;
  const image = light ? logoLight : logo;

  return (
    <span className="logo" role="img" aria-label="Kerben Travel">
      <Image
        src={image}
        alt=""
        height={height}
        width={Math.round((height * image.width) / image.height)}
        loading={large ? "lazy" : "eager"}
        className="logo-image"
      />
    </span>
  );
}
