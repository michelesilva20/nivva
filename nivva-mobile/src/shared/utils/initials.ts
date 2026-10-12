export const LOCAL_DEMO_DISPLAY_NAME = "Nivva Demo";

export function initialsFromDisplayName(name: string | null | undefined): string | null {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) {
    return null;
  }

  const first = parts[0];
  if (!first) {
    return null;
  }

  if (parts.length === 1) {
    return first.slice(0, 2).toUpperCase();
  }

  const last = parts[parts.length - 1];
  if (!last) {
    return first.slice(0, 2).toUpperCase();
  }

  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}
