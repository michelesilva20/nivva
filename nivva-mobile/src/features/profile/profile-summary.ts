export type LoadStatus = "loading" | "ready" | "error";

export type ProfileCount = {
  status: LoadStatus;
  value: number | null;
};

export function profileCountFromLoad(loadStatus: LoadStatus, length: number): ProfileCount {
  if (loadStatus !== "ready") {
    return { status: loadStatus, value: null };
  }

  return { status: "ready", value: length };
}

export function formatProfileCount(count: ProfileCount): string {
  if (count.status !== "ready" || count.value == null) {
    return "—";
  }

  return String(count.value);
}
