import { llmsTxt } from "@/utils/markdown/maps";
import { textResponse } from "@/utils/markdown/response";

export async function GET() {
  return textResponse(await llmsTxt(), "text/plain");
}
