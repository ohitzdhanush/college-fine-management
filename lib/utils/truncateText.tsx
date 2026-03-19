export function truncateText(text: string, length: number): string {
  if (typeof text !== "string") return "";
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "...";
}
