/**
 * OmimDataDO — Durable Object for staging large OMIM API responses.
 *
 * Extends RestStagingDO with schema hints for OMIM entry, genemap,
 * clinical synopsis, and allelic variant data structures.
 */

import { RestStagingDO } from "@bio-mcp/shared/staging/rest-staging-do";
import type { SchemaHints } from "@bio-mcp/shared/staging/schema-inference";

export class OmimDataDO extends RestStagingDO {
    protected getSchemaHints(data: unknown): SchemaHints | undefined {
        if (!data || typeof data !== "object") return undefined;

        const obj = data as Record<string, unknown>;

        // OMIM API wraps results in an omim.entryList array
        if (obj.omim && typeof obj.omim === "object") {
            const omim = obj.omim as Record<string, unknown>;

            // Entry results — /entry endpoint
            if (Array.isArray(omim.entryList)) {
                const sample = omim.entryList[0] as Record<string, unknown> | undefined;
                if (sample?.entry) {
                    return {
                        tableName: "entries",
                        indexes: ["mimNumber", "status", "prefix"],
                        flatten: { titles: 1, textSectionList: 1 },
                    };
                }
            }

            // Search results — /entry/search endpoint
            if (omim.searchResponse && typeof omim.searchResponse === "object") {
                const sr = omim.searchResponse as Record<string, unknown>;
                if (Array.isArray(sr.entryList)) {
                    return {
                        tableName: "entries",
                        indexes: ["mimNumber", "status", "prefix"],
                    };
                }
            }
        }

        // GeneMap results — /geneMap or /geneMap/search
        if (obj.omim && typeof obj.omim === "object") {
            const omim = obj.omim as Record<string, unknown>;

            if (Array.isArray(omim.geneMapList)) {
                return {
                    tableName: "genemap",
                    indexes: ["chromosome", "geneSymbols", "mimNumber", "phenotypeMapList"],
                    flatten: { phenotypeMapList: 1 },
                };
            }

            if (omim.searchResponse && typeof omim.searchResponse === "object") {
                const sr = omim.searchResponse as Record<string, unknown>;
                if (Array.isArray(sr.geneMapList)) {
                    return {
                        tableName: "genemap",
                        indexes: ["chromosome", "geneSymbols", "mimNumber"],
                    };
                }
            }
        }

        // Clinical synopsis results — /clinicalSynopsis or /clinicalSynopsis/search
        if (obj.omim && typeof obj.omim === "object") {
            const omim = obj.omim as Record<string, unknown>;

            if (Array.isArray(omim.clinicalSynopsisList)) {
                return {
                    tableName: "clinical_synopsis",
                    indexes: ["mimNumber", "preferredTitle"],
                };
            }

            if (omim.searchResponse && typeof omim.searchResponse === "object") {
                const sr = omim.searchResponse as Record<string, unknown>;
                if (Array.isArray(sr.clinicalSynopsisList)) {
                    return {
                        tableName: "clinical_synopsis",
                        indexes: ["mimNumber", "preferredTitle"],
                    };
                }
            }
        }

        // Allelic variant list — /entry/allelicVariantList
        if (Array.isArray(data)) {
            const sample = data[0];
            if (sample && typeof sample === "object" && "allelicVariant" in sample) {
                return {
                    tableName: "allelic_variants",
                    indexes: ["mimNumber", "name", "dbSnps", "status"],
                };
            }
        }

        return undefined;
    }
}
