export type AssistantErrorCode =
  | "notConfigured"
  | "dailyLimit"
  | "busy"
  | "refusal"
  | "network"
  | "server"
  | "unauthorized";

/** Код ошибки websocket backend → текст для человека из словаря (dict.ai.errors) */
export function chatErrorCode(code: string): AssistantErrorCode {
  switch (code) {
    case "rate_limited":
    case "ai_rate_limit":
      return "dailyLimit";
    case "ai_busy":
      return "busy";
    case "authentication_failed":
    case "session_expired":
      return "unauthorized";
    case "ai_unavailable":
    case "service_unavailable":
      return "notConfigured";
    default:
      return "server";
  }
}
