const TIME_ZONE = "America/New_York";

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    timeZone: TIME_ZONE,
    dateStyle: "medium",
    timeStyle: "short",
  });

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    timeZone: TIME_ZONE,
    dateStyle: "medium",
  });

export const formatLongDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    timeZone: TIME_ZONE,
    dateStyle: "long",
  });
