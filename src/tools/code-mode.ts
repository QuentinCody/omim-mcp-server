/**
 * OMIM Code Mode — registers search + execute tools for full API access.
 *
 * search: In-process catalog query, returns matching endpoints with docs.
 * execute: V8 isolate with api.get/api.post + searchSpec/listCategories.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createSearchTool } from "@bio-mcp/shared/codemode/search-tool";
import { createExecuteTool } from "@bio-mcp/shared/codemode/execute-tool";
import { omimCatalog } from "../spec/catalog";
import { createOmimApiFetch } from "../lib/api-adapter";

interface CodeModeEnv {
    OMIM_DATA_DO: DurableObjectNamespace;
    CODE_MODE_LOADER: WorkerLoader;
    OMIM_API_KEY: string;
}

/**
 * Register omim_search and omim_execute tools.
 */
export function registerCodeMode(
    server: McpServer,
    env: CodeModeEnv,
) {
    if (!env.OMIM_API_KEY) {
        // Register a stub search tool that works without API key
        // but skip execute since it needs the key for API calls
        const searchTool = createSearchTool({
            prefix: "omim",
            catalog: omimCatalog,
        });
        searchTool.register(server as unknown as { tool: (...args: unknown[]) => void });
        return;
    }

    const apiFetch = createOmimApiFetch(env.OMIM_API_KEY);

    // Register the search tool (in-process, no isolate)
    const searchTool = createSearchTool({
        prefix: "omim",
        catalog: omimCatalog,
    });
    searchTool.register(server as unknown as { tool: (...args: unknown[]) => void });

    // Register the execute tool (V8 isolate via DynamicWorkerExecutor)
    const executeTool = createExecuteTool({
        prefix: "omim",
        catalog: omimCatalog,
        apiFetch,
        doNamespace: env.OMIM_DATA_DO,
        loader: env.CODE_MODE_LOADER,
    });
    executeTool.register(server as unknown as { tool: (...args: unknown[]) => void });
}
