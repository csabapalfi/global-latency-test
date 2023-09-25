# Global latency test

Small vercel edge runtime app + scripts to compare/test latency from all the [18 vercel regions](https://vercel.com/docs/edge-network/regions).

## Usage

```sh
# generate routes for all regions
./script/generate-routes.sh

# deploy
vercel deploy
export API_BASEURL=https://<your-deployed-version-of-this>.vercel.app/api

# setup urls.tsv with <url>\t<label> entries
cat > urls.tsv <<EOF
https://web.dev/	homepage
EOF

# run tests from all regions
# also, configure request count and parallelism in this script
# will output <destination>/<region>-<label>.json files
./scripts/test-urls.sh input/urls.tsv output/run-1

# aggregate all latencies in a single CSV file like region,label,latency
./scripts/aggregate.sh output/run-1 > output/run-1/latencies.csv

# merge CSV files if you've done multiple runs
./scripts/aggregate.sh output/run-1/latencies.csv output/run-2/latencies.csv > output/latencies.csv
```