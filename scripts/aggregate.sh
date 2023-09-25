#!/usr/bin/env bash

directory="$1"

echo "region, label, latency"

for file in "$directory"/*.json; do
    jq -r '
        . as $root
        | .latencies | to_entries[] 
        | "\($root.region.actual.id), \($root.label), \(.value)"' "$file"
done

