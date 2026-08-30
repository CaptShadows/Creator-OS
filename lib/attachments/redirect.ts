export function attachmentRedirect(
  value: FormDataEntryValue | null,
  key: string,
  status: string,
) {
  const safe =
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//")
      ? value
      : "/";
  const url = new URL(safe, "http://creator-os.local");
  url.searchParams.set(key, status);
  return new Response(null, {
    status: 303,
    headers: { location: `${url.pathname}${url.search}` },
  });
}
