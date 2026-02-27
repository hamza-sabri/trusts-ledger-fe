// Fetch the OpenAPI schema from the backend and save it locally
const urls = [
  "https://trusts-ledger.clinixa.cloud/api/schema/?format=json",
  "https://trusts-ledger.clinixa.cloud/api/schema/",
  "https://trusts-ledger.clinixa.cloud/api/schema/?format=yaml",
  "https://trusts-ledger.clinixa.cloud/api/schema/?format=openapi-json",
]

async function tryFetch(url) {
  try {
    console.log(`Trying: ${url}`)
    const res = await fetch(url, {
      headers: {
        Accept: "application/json, application/yaml, application/vnd.oai.openapi+json, */*",
      },
    })
    console.log(`Status: ${res.status}`)
    console.log(`Content-Type: ${res.headers.get("content-type")}`)
    if (res.ok) {
      const text = await res.text()
      console.log(`Response length: ${text.length}`)
      console.log(`First 2000 chars:\n${text.substring(0, 2000)}`)
      return text
    } else {
      const text = await res.text()
      console.log(`Error body: ${text.substring(0, 500)}`)
    }
  } catch (err) {
    console.log(`Error: ${err.message}`)
  }
  return null
}

for (const url of urls) {
  const result = await tryFetch(url)
  if (result) break
  console.log("---")
}
