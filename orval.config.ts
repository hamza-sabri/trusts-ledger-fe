import { defineConfig } from "orval"

export default defineConfig({
  trustsLedger: {
    input: {
      target: "https://trusts-ledger.clinixa.cloud/api/schema/",
    },
    output: {
      target: "./lib/api/generated/endpoints.ts",
      schemas: "./lib/api/generated/models",
      client: "react-query",
      mode: "tags-split",
      override: {
        mutator: {
          path: "./lib/api/client.ts",
          name: "apiClient",
        },
        query: {
          useQuery: true,
          useMutation: true,
        },
      },
    },
  },
})
