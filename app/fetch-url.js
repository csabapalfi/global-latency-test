import computeBenchmarkIndex from "./benchmark";

export default function fetchUrl(region) {
  return async (request) => {
    const { url, label, includeHeaders, includeBenchmark, count, parallel } = parseSearchParams(request.url);
    if (isInvalidRequest(url, count, parallel, region)) {
      return badResponse(region, url, count, parallel, includeBenchmark);
    }
    const { latencies, headers } = await fetchAndMeasure(url, count, parallel, includeHeaders);
    return buildResponse(region, url, label, latencies, headers, includeBenchmark);
  };
}

function parseSearchParams(url) {
  const searchParams = new URL(url).searchParams;
  return {
    url: searchParams.get("url"),
    label: searchParams.get("label"),
    includeHeaders: searchParams.get("headers") === "true",
    includeBenchmark: searchParams.get("benchmark") === "true",
    count: parseParamToInt(searchParams.get("count"), 3),
    parallel: parseParamToInt(searchParams.get("parallel"), 3),
  };
}

function parseParamToInt(param, defaultValue) {
  const parsedValue = parseInt(param || "", 10);
  return isNaN(parsedValue) ? defaultValue : parsedValue;
}

function isInvalidRequest(url, count, parallel, region) {
  return (
    !url ||
    count <= 0 ||
    parallel <= 0 ||
    (region.actual.id !== "dev1" && region.actual.id !== region.target.id)
  );
}

function badResponse(region, url, count, parallel, includeBenchmark) {
  return new Response(
    JSON.stringify({
      error: "Bad Request",
      region,
      url,
      count,
      parallel,
      ...(includeBenchmark && { benchmarkIndex: computeBenchmarkIndex() }),
    }, null, 2),
    { status: 400 }
  );
}

async function fetchAndMeasure(url, count, parallel, includeHeaders) {
  const latencies = [];
  const headers = [];
  for (let i = 0; i < count; i += parallel) {
    const results = await Promise.all(
      Array(Math.min(parallel, count - i)).fill().map(() => fetchWithLatency(url, includeHeaders))
    );
    latencies.push(...results.map(result => result.latency));
    if (includeHeaders) {
      headers.push(...results.map(result => result.headers));
    }
  }
  return { latencies, headers };
}

async function fetchWithLatency(url, includeHeaders) {
  const start = Date.now();
  const response = await fetch(url);
  const latency = Date.now() - start;
  let headers = {};
  if (includeHeaders) {
    for (let [key, value] of response.headers.entries()) {
      headers[key] = value;
    }
  }
  return { latency, headers };
}

function buildResponse(region, url, label, latencies, headers, includeBenchmark) {
  return Response.json({
    region,
    ...(includeBenchmark && { benchmarkIndex: computeBenchmarkIndex() }),
    url,
    label,
    latencies,
    ...(headers.length > 0 && { headers }),
  });
}
