/**
 * OMIM API catalog — hand-built from https://api.omim.org/api docs.
 *
 * Covers the core OMIM endpoints for entry retrieval, gene map,
 * clinical synopsis, allelic variants, and search functionality.
 *
 * All endpoints require an apiKey query parameter and format=json,
 * both of which are auto-injected by the adapter.
 */

import type { ApiCatalog } from "@bio-mcp/shared/codemode/catalog";

export const omimCatalog: ApiCatalog = {
    name: "OMIM",
    baseUrl: "https://api.omim.org/api",
    version: "2.0",
    auth: "apiKey (auto-injected by adapter — do NOT pass manually)",
    endpointCount: 14,
    notes:
        "- All endpoints require `apiKey` and `format=json` params — these are auto-injected by the adapter. Do NOT include them in requests.\n" +
        "- MIM numbers are 6-digit identifiers (e.g., 601728 for BRCA2, 113705 for BRCA1)\n" +
        "- Entry prefixes indicate type: * = gene, # = phenotype with known molecular basis, % = phenotype/locus with unknown molecular basis, + = gene with phenotype, null = other\n" +
        "- The `include` parameter is comma-separated and controls what data is returned with entries: text, clinicalSynopsis, geneMap, allelicVariants, externalLinks, contributors, creationDate, editHistory, dates, referenceList\n" +
        "- Search supports boolean operators: AND, OR, NOT (e.g., 'breast AND cancer')\n" +
        "- Filter values for entry/search: 'gene' for gene entries, 'phenotype' for phenotype entries, 'gene_phenotype' for both\n" +
        "- Rate limit: 4 requests/second\n" +
        "- Pagination: use `start` (0-based offset) and `limit` (max results per page, default 10)\n" +
        "- Responses are wrapped in an `omim` root object. Entry results in `omim.entryList`, search in `omim.searchResponse`",
    endpoints: [
        // === Entry Retrieval ===
        {
            method: "GET",
            path: "/entry",
            summary:
                "Retrieve one or more OMIM entries by MIM number. Returns detailed entry data including text, gene map, clinical synopsis, and allelic variants based on the include parameter.",
            category: "entry",
            queryParams: [
                {
                    name: "mimNumber",
                    type: "string",
                    required: true,
                    description:
                        "MIM number(s) to retrieve, comma-separated for multiple (e.g., '601728' or '601728,113705')",
                },
                {
                    name: "include",
                    type: "string",
                    required: false,
                    description:
                        "Comma-separated list of sections to include: text, clinicalSynopsis, geneMap, allelicVariants, externalLinks, contributors, creationDate, editHistory, dates, referenceList",
                },
            ],
        },

        // === Entry Search ===
        {
            method: "GET",
            path: "/entry/search",
            summary:
                "Search OMIM entries by text query. Supports boolean operators (AND, OR, NOT) and field-specific searches.",
            category: "search",
            queryParams: [
                {
                    name: "search",
                    type: "string",
                    required: true,
                    description:
                        "Search query. Supports boolean operators: 'breast AND cancer', 'BRCA1 OR BRCA2'. Field-specific: 'gene_symbol:BRCA2'",
                },
                {
                    name: "filter",
                    type: "string",
                    required: false,
                    description: "Filter results by type",
                    enum: ["gene", "phenotype", "gene_phenotype"],
                },
                {
                    name: "fields",
                    type: "string",
                    required: false,
                    description:
                        "Comma-separated list of fields to return (e.g., 'mimNumber,status,titles')",
                },
                {
                    name: "include",
                    type: "string",
                    required: false,
                    description:
                        "Comma-separated list of sections to include with each entry",
                },
                {
                    name: "start",
                    type: "number",
                    required: false,
                    description: "0-based offset for pagination (default: 0)",
                },
                {
                    name: "limit",
                    type: "number",
                    required: false,
                    description: "Max results to return (default: 10, max: 20)",
                },
                {
                    name: "sort",
                    type: "string",
                    required: false,
                    description: "Sort field (e.g., 'score desc')",
                },
                {
                    name: "retrieve",
                    type: "string",
                    required: false,
                    description: "Retrieve type: 'geneMap' to return gene map data with results",
                },
            ],
        },

        // === Gene Map ===
        {
            method: "GET",
            path: "/geneMap",
            summary:
                "Get the OMIM gene map for a chromosome location. Returns genes mapped to cytogenetic or sequence-based locations.",
            category: "genemap",
            queryParams: [
                {
                    name: "chromosome",
                    type: "string",
                    required: false,
                    description: "Chromosome number (1-22, X, Y)",
                },
                {
                    name: "start",
                    type: "number",
                    required: false,
                    description: "Start position (bp) or cytogenetic band",
                },
                {
                    name: "end",
                    type: "number",
                    required: false,
                    description: "End position (bp) or cytogenetic band",
                },
                {
                    name: "mimNumber",
                    type: "string",
                    required: false,
                    description: "Retrieve gene map for a specific MIM number",
                },
            ],
        },
        {
            method: "GET",
            path: "/geneMap/search",
            summary:
                "Search the OMIM gene map by text query. Returns gene map entries matching the search criteria.",
            category: "genemap",
            queryParams: [
                {
                    name: "search",
                    type: "string",
                    required: true,
                    description:
                        "Search query (e.g., 'breast cancer', 'chromosome:17')",
                },
                {
                    name: "filter",
                    type: "string",
                    required: false,
                    description: "Filter results by type",
                    enum: ["gene", "phenotype"],
                },
                {
                    name: "start",
                    type: "number",
                    required: false,
                    description: "0-based offset for pagination",
                },
                {
                    name: "limit",
                    type: "number",
                    required: false,
                    description: "Max results to return (default: 10)",
                },
                {
                    name: "fields",
                    type: "string",
                    required: false,
                    description: "Comma-separated list of fields to return",
                },
                {
                    name: "sort",
                    type: "string",
                    required: false,
                    description: "Sort field",
                },
                {
                    name: "retrieve",
                    type: "string",
                    required: false,
                    description: "Retrieve type: 'geneMap' to include full gene map data",
                },
            ],
        },

        // === Clinical Synopsis ===
        {
            method: "GET",
            path: "/clinicalSynopsis",
            summary:
                "Get clinical synopsis for an OMIM entry. Returns structured clinical features organized by body system (e.g., Head, Eyes, Cardiovascular).",
            category: "clinical-synopsis",
            queryParams: [
                {
                    name: "mimNumber",
                    type: "string",
                    required: true,
                    description: "MIM number for the clinical synopsis (e.g., '176300')",
                },
                {
                    name: "include",
                    type: "string",
                    required: false,
                    description: "Additional data to include (e.g., 'externalLinks')",
                },
            ],
        },
        {
            method: "GET",
            path: "/clinicalSynopsis/search",
            summary:
                "Search OMIM clinical synopses by text query. Useful for finding phenotypes by clinical features (e.g., 'macrocephaly').",
            category: "clinical-synopsis",
            queryParams: [
                {
                    name: "search",
                    type: "string",
                    required: true,
                    description:
                        "Search query for clinical features (e.g., 'macrocephaly', 'seizures AND intellectual disability')",
                },
                {
                    name: "filter",
                    type: "string",
                    required: false,
                    description: "Filter by system category (e.g., 'Head and Neck', 'Neurologic')",
                },
                {
                    name: "start",
                    type: "number",
                    required: false,
                    description: "0-based offset for pagination",
                },
                {
                    name: "limit",
                    type: "number",
                    required: false,
                    description: "Max results to return (default: 10)",
                },
                {
                    name: "fields",
                    type: "string",
                    required: false,
                    description: "Comma-separated list of fields to return",
                },
                {
                    name: "retrieve",
                    type: "string",
                    required: false,
                    description: "Retrieve type: 'clinicalSynopsis' to include full data",
                },
            ],
        },

        // === Allelic Variants ===
        {
            method: "GET",
            path: "/entry/allelicVariantList",
            summary:
                "Get the list of allelic variants (mutations) for an OMIM gene entry. Returns variant name, mutation details, and associated phenotypes.",
            category: "allelic-variant",
            queryParams: [
                {
                    name: "mimNumber",
                    type: "string",
                    required: true,
                    description: "MIM number of the gene entry (e.g., '601728' for BRCA2)",
                },
            ],
        },

        // === Allelic Variant Search ===
        {
            method: "GET",
            path: "/allelicVariant/search",
            summary:
                "Search for allelic variants across all OMIM entries. Returns variants matching the search criteria.",
            category: "allelic-variant",
            queryParams: [
                {
                    name: "search",
                    type: "string",
                    required: true,
                    description:
                        "Search query (e.g., 'Val600Glu', 'breast cancer', 'dbSnp:rs80357906')",
                },
                {
                    name: "start",
                    type: "number",
                    required: false,
                    description: "0-based offset for pagination",
                },
                {
                    name: "limit",
                    type: "number",
                    required: false,
                    description: "Max results to return (default: 10)",
                },
                {
                    name: "fields",
                    type: "string",
                    required: false,
                    description: "Comma-separated list of fields to return",
                },
            ],
        },

        // === Entry Retrieval with Specific Sections ===
        {
            method: "GET",
            path: "/entry/referenceList",
            summary:
                "Get the reference (bibliography) list for an OMIM entry. Returns PubMed IDs and citation details.",
            category: "entry",
            queryParams: [
                {
                    name: "mimNumber",
                    type: "string",
                    required: true,
                    description: "MIM number to retrieve references for",
                },
            ],
        },

        // === Gene Map Retrieval by Range ===
        {
            method: "GET",
            path: "/geneMap/range",
            summary:
                "Get gene map entries within a specific chromosomal range. Useful for locus-level queries.",
            category: "genemap",
            queryParams: [
                {
                    name: "chromosome",
                    type: "string",
                    required: true,
                    description: "Chromosome (1-22, X, Y)",
                },
                {
                    name: "start",
                    type: "number",
                    required: true,
                    description: "Start position in base pairs",
                },
                {
                    name: "end",
                    type: "number",
                    required: true,
                    description: "End position in base pairs",
                },
            ],
        },

        // === Entry Handler — External Links ===
        {
            method: "GET",
            path: "/entry/externalLinks",
            summary:
                "Get external database links for an OMIM entry. Returns links to resources like NCBI, Ensembl, UniProt, GeneReviews, etc.",
            category: "entry",
            queryParams: [
                {
                    name: "mimNumber",
                    type: "string",
                    required: true,
                    description: "MIM number to retrieve external links for",
                },
            ],
        },

        // === Phenotype Map Search ===
        {
            method: "GET",
            path: "/phenotypeMap/search",
            summary:
                "Search the OMIM phenotype map. Returns phenotype-gene relationships with inheritance patterns and mapping keys.",
            category: "search",
            queryParams: [
                {
                    name: "search",
                    type: "string",
                    required: true,
                    description:
                        "Search query for phenotype map entries (e.g., 'breast cancer', 'autosomal dominant')",
                },
                {
                    name: "start",
                    type: "number",
                    required: false,
                    description: "0-based offset for pagination",
                },
                {
                    name: "limit",
                    type: "number",
                    required: false,
                    description: "Max results to return (default: 10)",
                },
                {
                    name: "fields",
                    type: "string",
                    required: false,
                    description: "Comma-separated list of fields to return",
                },
            ],
        },

        // === Entry Update History ===
        {
            method: "GET",
            path: "/entry/editHistory",
            summary:
                "Get the edit history for an OMIM entry. Shows when the entry was created and modified.",
            category: "entry",
            queryParams: [
                {
                    name: "mimNumber",
                    type: "string",
                    required: true,
                    description: "MIM number to retrieve edit history for",
                },
            ],
        },
    ],
};
