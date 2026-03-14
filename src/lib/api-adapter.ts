/**
 * OMIM API adapter — wraps omimFetch into the ApiFetchFn interface
 * for use by the Code Mode __api_proxy tool.
 *
 * The adapter captures the API key from the environment via closure
 * so that Code Mode isolates never see the key directly.
 */

import type { ApiFetchFn } from "@bio-mcp/shared/codemode/catalog";
import { omimFetch } from "./http";

/**
 * Create an ApiFetchFn that routes through omimFetch.
 * The apiKey is captured via closure from the environment.
 */
export function createOmimApiFetch(apiKey: string): ApiFetchFn {
    return async (request) => {
        const response = await omimFetch(request.path, request.params, apiKey);

        if (!response.ok) {
            let errorBody: string;
            try {
                errorBody = await response.text();
            } catch {
                errorBody = response.statusText;
            }
            const error = new Error(
                `HTTP ${response.status}: ${errorBody.slice(0, 200)}`,
            ) as Error & {
                status: number;
                data: unknown;
            };
            error.status = response.status;
            error.data = errorBody;
            throw error;
        }

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("json")) {
            const text = await response.text();
            return { status: response.status, data: text };
        }

        const data = await response.json();
        return { status: response.status, data };
    };
}
