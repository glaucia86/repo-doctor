export const createHeaders = (): Record<string, string> => ({ "content-type": "application/json" });

export const requestJson = async (url: string, init: RequestInit = {}): Promise<Record<string, unknown>> => {
  const response = await fetch(url, init);
  const payload: unknown = await response.json().catch(() => ({}));
  const payloadObject =
    payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  if (!response.ok) {
    const message = typeof payloadObject.message === "string" ? payloadObject.message : "Request failed.";
    throw new Error(message);
  }
  return payloadObject;
};
