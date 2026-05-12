export interface Env {
  COMMS_BASE_URL?: string;
}

const DEFAULT_BASE_URL = "https://comms.dlowehomelab.com";

async function requestJson<T>(
  env: Env,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const baseUrl = env.COMMS_BASE_URL || DEFAULT_BASE_URL;
  const url = `${baseUrl}${path}`;

  const response = await fetch(url, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const responseText = await response.text();
  const payload = responseText ? JSON.parse(responseText) : null;

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status} ${response.statusText} for ${path}: ${JSON.stringify(payload)}`,
    );
  }

  return payload as T;
}

export const commsClient = {
  readPinned: (env: Env) => requestJson<unknown>(env, "/pinned"),
  readChannel: (env: Env, channel: string) =>
    requestJson<unknown>(env, `/channel/${encodeURIComponent(channel)}`),
  readBroadcast: (env: Env) => requestJson<unknown>(env, "/broadcast"),
  readSubcategory: (env: Env, channel: string, subcategory: string) =>
    requestJson<unknown>(
      env,
      `/channel/${encodeURIComponent(channel)}/subcategory/${encodeURIComponent(subcategory)}`,
    ),
  postBroadcast: (env: Env, sender: string, content: string) =>
    requestJson<unknown>(env, "/broadcast", {
      method: "POST",
      body: JSON.stringify({ sender, content }),
    }),
  postChannel: (env: Env, channel: string, sender: string, content: string) =>
    requestJson<unknown>(env, `/channel/${encodeURIComponent(channel)}`, {
      method: "POST",
      body: JSON.stringify({ sender, content }),
    }),
  postSubcategory: (
    env: Env,
    channel: string,
    subcategory: string,
    sender: string,
    content: string,
  ) =>
    requestJson<unknown>(
      env,
      `/channel/${encodeURIComponent(channel)}/subcategory/${encodeURIComponent(subcategory)}`,
      {
        method: "POST",
        body: JSON.stringify({ sender, content }),
      },
    ),
};
