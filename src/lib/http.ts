/**
 * OMIM API HTTP client with automatic API key injection and rate limit handling.
 *
 * OMIM enforces 4 req/sec. The apiKey and format=json params are
 * auto-appended to every request.
 */

import { restFetch, type RestFetchOptions } from "@bio-mcp/shared/http/rest-fetch";

const OMIM_BASE = "https://api.omim.org/api";

export interface OmimFetchOptions extends Omit<RestFetchOptions, "retryOn"> {
    /** Override base URL */
    baseUrl?: string;
}

/**
 * Fetch from the OMIM API with built-in API key injection and rate limit handling.
 *
 * Automatically appends `apiKey` and `format=json` to all requests.
 * Returns an error Response if OMIM_API_KEY is not configured.
 */
export function omimFetch(
    path: string,
    params: Record<string, unknown> | undefined,
    apiKey: string,
    opts?: OmimFetchOptions,
): Promise<Response> {
    const baseUrl = opts?.baseUrl ?? OMIM_BASE;

    // Merge apiKey and format into params
    const mergedParams: Record<string, unknown> = {
        ...params,
        apiKey,
        format: "json",
    };

    const headers: Record<string, string> = {
        Accept: "application/json",
        ...(opts?.headers ?? {}),
    };

    return restFetch(baseUrl, path, mergedParams, {
        ...opts,
        headers,
        retryOn: [429, 500, 502, 503],
        retries: opts?.retries ?? 3,
        timeout: opts?.timeout ?? 30_000,
        userAgent: "omim-mcp-server/1.0 (bio-mcp; https://github.com/QuentinCody/omim-mcp-server)",
    });
}
