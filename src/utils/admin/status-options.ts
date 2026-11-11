import { PICKABLE_STATUSES, REQUEST_STATUSES, type RequestStatus } from "./resources";

const withTone = (s: (typeof REQUEST_STATUSES)[number]) => ({ ...s, tone: `admin-tone-${s.value}` });
const OPTIONS = PICKABLE_STATUSES.map(withTone);
const ALL = REQUEST_STATUSES.map(withTone);

export function statusOptions(value: RequestStatus) {
  return OPTIONS.some((o) => o.value === value) ? OPTIONS : [...ALL.filter((o) => o.value === value), ...OPTIONS];
}
