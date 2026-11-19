import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Icon } from "@/components/ui/icon/Icon";

afterEach(cleanup);

describe("иконки", () => {
  it.each(["whatsapp", "telegram", "instagram", "facebook"] as const)("%s — фирменный логотип заливкой", (name) => {
    const { container } = render(<Icon name={name} size={22} className="x" />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("fill")).toBe("currentColor");
    expect(svg?.hasAttribute("stroke")).toBe(false);
    expect(svg?.getAttribute("width")).toBe("22");
    expect(svg?.getAttribute("class")).toBe("icon x");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(svg?.querySelector("path")?.getAttribute("d")?.length).toBeGreaterThan(300);
  });

  it("обычные иконки остаются контурными", () => {
    const { container } = render(<Icon name="phone" />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("fill")).toBe("none");
    expect(svg?.getAttribute("stroke")).toBe("currentColor");
  });
});
