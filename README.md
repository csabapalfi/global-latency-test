# Global latency test

Small vercel edge runtime app + scripts to compare/test latency from all the [18 vercel regions](https://vercel.com/docs/edge-network/regions).

## Usage

```sh
# deploy
vercel deploy
export API_BASEURL=https://<your-deployed-version-of-this>.vercel.app/api

# setup urls.tsv with <url>\t<label> entries
cat > urls.tsv <<EOF
https://web.dev/	homepage
EOF

# run tests from all regions, will output <destination>/<region>-<label>.json files
./scripts/test-urls.sh input/urls.tsv output/run-1

# aggregate all latencies in a single CSV file like region,label,latency
./scripts/aggregate.sh output/run-1 > latencies.csv
```