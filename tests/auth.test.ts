import { afterEach, describe, expect, it, vi } from "vitest";
import { signIn, signUp, toAuthError } from "@/utils/auth";
import { readSession, writeSession } from "@/utils/store/auth";
import { validateAuth, validateChatMessage } from "@/utils/validation";

describe("validateAuth", () => {
  it("вход — по логину или email", () => {
    expect(validateAuth("login", { login: "aidana", password: "123456" })).toEqual({});
    expect(validateAuth("login", { login: "a@b.kg", password: "123456" })).toEqual({});
    expect(validateAuth("login", { login: "a@b", password: "123456" }).login).toBe("email");
    expect(validateAuth("login", { login: " ", password: "" })).toEqual({ login: "required", password: "required" });
  });

  it("регистрация — логин от 3 до 50 символов без «@», как в backend", () => {
    expect(validateAuth("register", { login: "ab", password: "secret12" }).login).toBe("short");
    expect(validateAuth("register", { login: "aidana@mail.kg", password: "secret12" }).login).toBe("short");
    expect(validateAuth("register", { login: "a".repeat(51), password: "secret12" }).login).toBe("tooLong");
  });

  it("правильная регистрация проходит", () => {
    expect(validateAuth("register", { login: "aidana_kg", password: "secret12" })).toEqual({});
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
    expect(toAuthError(422, { detail: [{ type: "missing", loc: ["body", "username"], msg: "Field required" }] })).toBe("login");
  });

  it("логин занят: backend отвечает 409 без слов «занят»", () => {
    expect(toAuthError(409, { detail: { code: "conflict", message: "Действие недоступно в текущем состоянии" } })).toBe("taken");
  });
});

describe("пароль как в backend", () => {
  it("при регистрации — от 8 символов, при входе длину решает backend", () => {
    expect(validateAuth("register", { login: "aidana", password: "secret1" }).password).toBe("short");
    expect(validateAuth("register", { login: "aidana", password: "secret12" }).password).toBeUndefined();
    expect(validateAuth("login", { login: "a@b.kg", password: "123" })).toEqual({});
  });
});

describe("signUp / signIn — формат запросов backend", () => {
  const profile = { client_id: 10, client_code: "KG-000010", username: "aidana_kg", name: null, phone: null, email: null };

  function mockBackend(responses: Record<string, { status: number; body: unknown }>) {
    const calls: { path: string; body: unknown }[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        const path = url.replace("/api/chat/account/", "");
        calls.push({ path, body: init?.body ? JSON.parse(String(init.body)) : undefined });
        const reply = responses[path] ?? { status: 404, body: {} };
        return new Response(JSON.stringify(reply.body), { status: reply.status, headers: { "Content-Type": "application/json" } });
      }),
    );
    return calls;
  }

  afterEach(() => {
    vi.unstubAllGlobals();
    writeSession(null);
  });

  it("регистрация отправляет только username и пароль и сразу входит по токену из 201", async () => {
    const calls = mockBackend({
      register: { status: 201, body: { access_token: "t1", token_type: "bearer", ...profile } },
      me: { status: 200, body: profile },
    });
    expect(await signUp("  aidana_kg ", "secret12")).toEqual({});
    expect(calls[0]).toEqual({ path: "register", body: { username: "aidana_kg", password: "secret12" } });
    expect(calls.map((c) => c.path)).toEqual(["register", "me"]);
    expect(readSession()).toEqual({ token: "t1", user: { id: "10", email: "", name: "aidana_kg", phone: "" } });
  });

  it("занятый логин — ошибка taken, сессии нет", async () => {
    mockBackend({ register: { status: 409, body: { detail: { code: "conflict", message: "Действие недоступно в текущем состоянии" } } } });
    expect(await signUp("aidana_kg", "secret12")).toEqual({ error: "taken" });
    expect(readSession()).toBeNull();
  });

  it("вход: логин уходит как username, адрес с «@» — как email", async () => {
    const calls = mockBackend({ login: { status: 200, body: { access_token: "t2", ...profile } }, me: { status: 200, body: profile } });
    await signIn("aidana_kg", "secret12");
    await signIn("aidana@mail.kg", "secret12");
    expect(calls.filter((c) => c.path === "login").map((c) => c.body)).toEqual([
      { username: "aidana_kg", password: "secret12" },
      { email: "aidana@mail.kg", password: "secret12" },
    ]);
  });
});
