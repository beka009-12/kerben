import { describe, expect, it } from "vitest";
import { toAuthError } from "@/utils/auth";
import { validateAuth, validateChatMessage } from "@/utils/validation";

describe("validateAuth", () => {
  it("при входе имя не нужно", () => {
    expect(validateAuth("login", { email: "a@b.kg", password: "123456" })).toEqual({});
  });

  it("при регистрации проверяет имя, телефон, email и пароль", () => {
    expect(validateAuth("register", { name: "A", phone: "12", email: "bad", password: "123" })).toEqual({
      name: "short",
      phone: "phone",
      email: "email",
      password: "short",
    });
    expect(validateAuth("register", { name: "Айдана", email: "aidana@mail.kg", password: "secret1" }).phone).toBe("required");
  });

  it("правильная регистрация проходит", () => {
    expect(
      validateAuth("register", { name: "Айдана", phone: "+996 700 123 456", email: "aidana@mail.kg", password: "secret12" }),
    ).toEqual({});
  });
});

describe("validateChatMessage", () => {
  it("пустое и слишком длинное сообщение не проходят", () => {
    expect(validateChatMessage("   ")).toBe("required");
    expect(validateChatMessage("x".repeat(1001))).toBe("tooLong");
    expect(validateChatMessage("Привет!")).toBeNull();
  });
});

describe("toAuthError", () => {
  it("переводит ответы backend в понятные коды", () => {
    expect(toAuthError(401, { detail: { code: "authentication_required", message: "Неверный email или пароль" } })).toBe("invalid");
    expect(toAuthError(409, { detail: "Email already registered" })).toBe("taken");
    expect(toAuthError(400, { detail: "Пользователь с таким email уже существует" })).toBe("taken");
    expect(toAuthError(422, { detail: [{ loc: ["body", "email"], msg: "value is not a valid email address" }] })).toBe("badEmail");
    expect(toAuthError(429, null)).toBe("rateLimit");
    expect(toAuthError(0, null)).toBe("network");
    expect(toAuthError(500, { detail: "???" })).toBe("unknown");
  });

  it("проверка backend (422) — подсказка по полю, а не «неверный пароль»", () => {
    const short = { detail: [{ type: "string_too_short", loc: ["body", "password"], msg: "String should have at least 8 characters" }] };
    expect(toAuthError(422, short)).toBe("short");
    expect(toAuthError(422, { detail: [{ loc: ["body", "phone"], msg: "String should have at least 7 characters" }] })).toBe("phone");
  });
});

describe("пароль как в backend", () => {
  it("при регистрации — от 8 символов, при входе длину решает backend", () => {
    expect(validateAuth("register", { name: "Айдана", phone: "+996 700 123 456", email: "a@b.kg", password: "secret1" }).password).toBe("short");
    expect(validateAuth("register", { name: "Айдана", phone: "+996 700 123 456", email: "a@b.kg", password: "secret12" }).password).toBeUndefined();
    expect(validateAuth("login", { email: "a@b.kg", password: "123" })).toEqual({});
  });
});
