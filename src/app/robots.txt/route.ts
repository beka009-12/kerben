import { robotsComment, robotsRules, robotsTxt } from "@/utils/robots-txt";
import { REVALIDATE, textResponse } from "@/utils/markdown/response";

export function GET() {
  return textResponse(robotsTxt(robotsRules(), robotsComment()), "text/plain", undefined, REVALIDATE);
}
