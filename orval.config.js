/** @type {import('orval').Options} */
module.exports = {
  trustsLedger: {
    input: {
      target: "https://trusts-ledger.clinixa.cloud/api/schema/?format=json",
    },
    output: {
      mode: "tags-split",
      target: "lib/api/generated",
      schemas: "lib/api/generated/model",
      client: "react-query",
      override: {
        mutator: {
          path: "lib/api/custom-instance.ts",
          name: "customInstance",
        },
        query: {
          useQuery: true,
          useInfinite: false,
          useSuspenseQuery: false,
          version: 5,
          signal: true,
        },
      },
    },
  },
}
