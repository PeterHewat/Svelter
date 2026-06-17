const CLOUDFLARE_API = "https://api.cloudflare.com/client/v4";

export type CloudflareAccount = {
  id: string;
  name: string;
};

export type CloudflareZone = {
  id: string;
  name: string;
  status: string;
  name_servers: string[];
};

export type CloudflarePagesProject = {
  id: string;
  name: string;
  subdomain?: string;
};

export type CloudflareApiResponse<T> = {
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  messages: Array<{ code: number; message: string }>;
  result: T;
};

/**
 * Error from a failed Cloudflare REST API call.
 */
export class CloudflareApiError extends Error {
  /** HTTP status from Cloudflare. */
  readonly status: number;
  /** Raw response body. */
  readonly body: string;

  /**
   * @param message - Short error label
   * @param status - HTTP status
   * @param body - Response body text
   */
  constructor(message: string, status: number, body: string) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

/**
 * Extracts a short human-readable message from a Cloudflare API error body.
 *
 * @param err - Failed Cloudflare API response
 */
export function formatCloudflareApiError(err: CloudflareApiError): string {
  try {
    const parsed = JSON.parse(err.body) as CloudflareApiResponse<unknown>;
    const first = parsed.errors?.[0]?.message;
    if (first) {
      return first;
    }
  } catch {
    // fall through
  }
  return err.body.slice(0, 200) || err.message;
}

/**
 * Whether Cloudflare rejected a request because the resource already exists.
 *
 * @param err - Failed Cloudflare API response
 */
export function isCloudflareAlreadyExistsError(
  err: CloudflareApiError,
): boolean {
  const message = formatCloudflareApiError(err).toLowerCase();
  return (
    err.status === 409 ||
    message.includes("already exists") ||
    message.includes("duplicate")
  );
}

type CloudflareFetchOptions = {
  method?: string;
  body?: unknown;
};

/**
 * Calls the Cloudflare REST API v4.
 *
 * @param token - API token
 * @param path - Path after `/client/v4` (e.g. `/accounts`)
 * @param options - HTTP method and JSON body
 */
export async function cloudflareFetch<T>(
  token: string,
  path: string,
  options?: CloudflareFetchOptions,
): Promise<T> {
  const response = await fetch(`${CLOUDFLARE_API}${path}`, {
    method: options?.method ?? (options?.body ? "POST" : "GET"),
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });
  const body = await response.text();
  if (!response.ok) {
    throw new CloudflareApiError(
      `Cloudflare API ${options?.method ?? "GET"} ${path} failed`,
      response.status,
      body,
    );
  }
  const parsed = JSON.parse(body) as CloudflareApiResponse<T>;
  if (!parsed.success) {
    throw new CloudflareApiError(
      `Cloudflare API ${path} returned success=false`,
      response.status,
      body,
    );
  }
  return parsed.result;
}

/**
 * Lists Cloudflare accounts visible to the API token.
 *
 * @param token - API token with Account Read
 */
export async function listCloudflareAccounts(
  token: string,
): Promise<CloudflareAccount[]> {
  return cloudflareFetch<CloudflareAccount[]>(token, "/accounts");
}

/**
 * Resolves a single account ID (first account when multiple).
 *
 * @param token - API token
 */
export async function resolveCloudflareAccountId(
  token: string,
): Promise<string> {
  const accounts = await listCloudflareAccounts(token);
  const first = accounts[0];
  if (!first?.id) {
    throw new Error("No Cloudflare accounts visible to this API token");
  }
  return first.id;
}

/**
 * Finds a Pages project by name.
 *
 * @param token - API token
 * @param accountId - Account ID
 * @param name - Project name
 */
export async function findPagesProjectByName(
  token: string,
  accountId: string,
  name: string,
): Promise<CloudflarePagesProject | null> {
  const projects = await cloudflareFetch<CloudflarePagesProject[]>(
    token,
    `/accounts/${accountId}/pages/projects`,
  );
  return projects.find((p) => p.name === name) ?? null;
}

/**
 * Creates a direct-upload Pages project (no Git source).
 *
 * @param token - API token
 * @param accountId - Account ID
 * @param name - Project name
 */
export async function createPagesProject(
  token: string,
  accountId: string,
  name: string,
): Promise<CloudflarePagesProject> {
  return cloudflareFetch<CloudflarePagesProject>(
    token,
    `/accounts/${accountId}/pages/projects`,
    {
      method: "POST",
      body: {
        name,
        production_branch: "main",
      },
    },
  );
}

/**
 * Returns an existing or newly created Pages project.
 *
 * @param token - API token
 * @param accountId - Account ID
 * @param name - Project name
 */
export async function ensurePagesProject(
  token: string,
  accountId: string,
  name: string,
): Promise<CloudflarePagesProject> {
  const existing = await findPagesProjectByName(token, accountId, name);
  if (existing) {
    return existing;
  }
  try {
    return await createPagesProject(token, accountId, name);
  } catch (err) {
    if (
      err instanceof CloudflareApiError &&
      isCloudflareAlreadyExistsError(err)
    ) {
      const raced = await findPagesProjectByName(token, accountId, name);
      if (raced) {
        return raced;
      }
    }
    throw err;
  }
}

/**
 * Attaches a custom domain to a Pages project.
 *
 * @param token - API token
 * @param accountId - Account ID
 * @param projectName - Pages project name
 * @param domain - Hostname (e.g. `example.com`)
 */
export async function ensurePagesProjectDomain(
  token: string,
  accountId: string,
  projectName: string,
  domain: string,
): Promise<void> {
  try {
    await cloudflareFetch(
      token,
      `/accounts/${accountId}/pages/projects/${projectName}/domains`,
      {
        method: "POST",
        body: { name: domain },
      },
    );
  } catch (err) {
    if (
      err instanceof CloudflareApiError &&
      isCloudflareAlreadyExistsError(err)
    ) {
      return;
    }
    throw err;
  }
}

/**
 * Finds a Cloudflare zone by apex domain name.
 *
 * @param token - API token
 * @param apex - Apex domain
 */
export async function findZoneByName(
  token: string,
  apex: string,
): Promise<CloudflareZone | null> {
  const zones = await cloudflareFetch<CloudflareZone[]>(
    token,
    `/zones?name=${encodeURIComponent(apex)}`,
  );
  return zones.find((z) => z.name.toLowerCase() === apex.toLowerCase()) ?? null;
}

/**
 * Returns an existing zone or creates a full zone on the account.
 *
 * @param token - API token
 * @param accountId - Account ID
 * @param apex - Apex domain
 */
export async function ensureZone(
  token: string,
  accountId: string,
  apex: string,
): Promise<CloudflareZone> {
  const existing = await findZoneByName(token, apex);
  if (existing) {
    return existing;
  }
  try {
    return await cloudflareFetch<CloudflareZone>(token, "/zones", {
      method: "POST",
      body: {
        name: apex,
        account: { id: accountId },
        type: "full",
      },
    });
  } catch (err) {
    if (
      err instanceof CloudflareApiError &&
      isCloudflareAlreadyExistsError(err)
    ) {
      const raced = await findZoneByName(token, apex);
      if (raced) {
        return raced;
      }
    }
    throw err;
  }
}
