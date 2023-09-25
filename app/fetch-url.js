import computeBenchmarkIndex from "./benchmark";

export default function fetchUrl(region) {
  return async (request) => {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const label = searchParams.get("label");
  const includeHeaders = searchParams.get("headers") === "true";
  const includeBenchmark = searchParams.get("benchmark") === "true";
  const countString = searchParams.get("count");
  const count = parseInt(countString ?? "", 10) || 3;
  const parallelString = searchParams.get("parallel");
  const parallel = parseInt(parallelString ?? "", 10) || 3;

  const latencies = [];
  const headers = [];

  if (
    !url ||
    isNaN(count) ||
    count <= 0 ||
    isNaN(parallel) ||
    parallel <= 0 ||
    (region.actual.id !== "dev1" && region.actual.id !== region.target.id)
  ) {
    return new Response(
      JSON.stringify(
        {
          error: "Bad Request",
          region,
          url,
          count,
          parallel,
          ...(includeBenchmark && { benchmarkIndex: computeBenchmarkIndex() }),
        },
        null,
        2
      ),
      { status: 400 }
    );
  }

  const fetchWithLatency = async () => {
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
  };

  for (let i = 0; i < count; i += parallel) {
    const promises = [];
    for (let j = 0; j < parallel && i + j < count; j++) {
      promises.push(fetchWithLatency());
    }
    const results = await Promise.all(promises);
    latencies.push(...results.map(({ latency }) => latency));
    if (includeHeaders) {
      headers.push(...results.map(({ headers }) => headers));
    }
  }

  latencies.sort();

  return Response.json({
    region,
    // benchmark always seem to cause edge function to time out
    ...(includeBenchmark && { benchmarkIndex: computeBenchmarkIndex() }),
    url,
    label,
    latencies,
    ...(includeHeaders && { headers }),
  });
}}
