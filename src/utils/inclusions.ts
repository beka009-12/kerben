export function inclusionLabel(item: string, names: Record<string, string>) {
  return names[item] ?? item;
}
