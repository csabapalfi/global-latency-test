import regions from "../../regions";
import fetchUrl from "../../fetch-url";

export const preferredRegion = "$region";

const region = {
  target: {
    id: "$region",
    name: regions["$region"],
  },
  actual: {
    id: process.env.VERCEL_REGION || "dev1",
    name: regions[process.env.VERCEL_REGION] || "localhost",
  },
};

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(request) {
  return fetchUrl(region)(request)
}
