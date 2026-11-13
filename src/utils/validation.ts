export type FieldError = "required" | "email" | "contact" | "phone" | "tooLong" | "pastDate" | "guests" | "short" | "dateOrder";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[\d\s()-]{7,20}$/;

export const isEmail = (value: string) => EMAIL.test(value.trim());

export function isPhone(value: string): boolean {
  const v = value.trim();
  return PHONE.test(v) && v.replace(/\D/g, "").length >= 7;
}

export function isContact(value: string): boolean {
  return isEmail(value) || isPhone(value);
}

function checkPhoneEmail<K extends string>(input: { phone?: string; email?: string }, errors: Partial<Record<K | "phone" | "email", FieldError>>) {
  if (!input.phone?.trim()) errors.phone = "required";
  else if (!isPhone(input.phone)) errors.phone = "phone";
  if (input.email?.trim() && !isEmail(input.email)) errors.email = "email";
}

export interface BookingInput {
  name: string;
  phone: string;
  email?: string;
  date?: string;
  endDate?: string;
  guests?: number;
  message?: string;
  tour: string;
}

export function validateBooking(input: Partial<BookingInput>, today?: string) {
  const errors: Partial<Record<keyof BookingInput, FieldError>> = {};
  if (!input.name?.trim()) errors.name = "required";
  else if (input.name.length > 80) errors.name = "tooLong";
  checkPhoneEmail(input, errors);
  if (input.date && today && input.date < today) errors.date = "pastDate";
  if (input.endDate && !input.date) errors.date = "required";
  else if (input.endDate && input.date && input.endDate < input.date) errors.endDate = "dateOrder";
  if (input.guests !== undefined && (input.guests < 1 || input.guests > 30)) errors.guests = "guests";
  if ((input.message?.length ?? 0) > 1000) errors.message = "tooLong";
  if (!input.tour) errors.tour = "required";
  return errors;
}

export interface MessageInput {
  name: string;
  phone: string;
  email: string;
  message: string;
}

export function validateMessage(input: Partial<MessageInput>) {
  const errors: Partial<Record<keyof MessageInput, FieldError>> = {};
  if (!input.name?.trim()) errors.name = "required";
  else if (input.name.length > 80) errors.name = "tooLong";
  checkPhoneEmail(input, errors);
  if (!input.message?.trim()) errors.message = "required";
  else if (input.message.trim().length < 10) errors.message = "short";
  else if (input.message.length > 2000) errors.message = "tooLong";
  return errors;
}

export const isValid = (errors: object) => Object.keys(errors).length === 0;

export function todayISO(): string {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

/** Минимальная длина пароля — как в backend (/account/register, /account/reset-password) */
export const PASSWORD_MIN = 8;

/** Логин аккаунта — как в backend (/account/register: username от 3 до 50 символов) */
export const LOGIN_MIN = 3;
export const LOGIN_MAX = 50;

export interface AuthInput {
  /** Регистрация — логин; вход — логин или email */
  login: string;
  /** Только для «забыли пароль» */
  email: string;
  password: string;
}

export function validateAuth(mode: "login" | "register", input: Pick<AuthInput, "login" | "password">) {
  const errors: Partial<Record<keyof AuthInput, FieldError>> = {};
  const login = input.login.trim();
  if (!login) errors.login = "required";
  // При входе с «@» backend ищет по email, поэтому в логине регистрации «@» запрещён — иначе войти не получится
  else if (mode === "register" && (login.length < LOGIN_MIN || login.includes("@"))) errors.login = "short";
  else if (mode === "register" && login.length > LOGIN_MAX) errors.login = "tooLong";
  else if (mode === "login" && login.includes("@") && !isEmail(login)) errors.login = "email";
  if (!input.password) errors.password = "required";
  // Backend принимает пароль от 8 символов; при входе длину не проверяем — старый пароль решает backend
  else if (mode === "register" && input.password.length < PASSWORD_MIN) errors.password = "short";
  return errors;
}

export function validateChatMessage(body: string): FieldError | null {
  if (!body.trim()) return "required";
  if (body.length > 1000) return "tooLong";
  return null;
}
