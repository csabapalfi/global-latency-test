#!/usr/bin/env bash

directory="$1"

echo "runtime, label, latency, index" > "$directory/output.csv"

for file in "$directory"/*.json; do
    jq -r '
        . as $root
        | .latencies | to_entries[] 
        | "\($root.region.actual.id), \($root.label), \(.value), \(.key+1)"' "$file" >> "$directory/output.csv"
done

