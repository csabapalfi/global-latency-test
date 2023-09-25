#!/usr/bin/env bash

# Check if directory argument is provided
if [[ $# -ne 1 ]]; then
    echo "Usage: $0 <directory_name>"
    exit 1
fi

# Directory containing JSON files
DIR="$1/"
if [[ ! -d $DIR ]]; then
    echo "Directory $DIR does not exist!"
    exit 1
fi

# Output CSV file
OUTPUT_FILE="${DIR}latencies.csv"

# List of regions
REGIONS="arn1 bom1 cdg1 cle1 cpt1 dub1 fra1 gru1 hkg1 hnd1 iad1 icn1 kix1 lhr1 pdx1 sfo1 sin1 syd1"
OPTIONS="current serverless edge"

# Create header row for the CSV
HEADER=""
for region in $REGIONS; do
    for option in $OPTIONS; do
        HEADER="${HEADER}${region}-${option},"
    done
done
echo ${HEADER%,} > $OUTPUT_FILE

# Initialize an empty array to store latencies for all combinations
declare -A LATENCY_MAP

# Parse each JSON file and extract latencies
for region in $REGIONS; do
    for option in $OPTIONS; do
        FILENAME="${DIR}${region}-${option}.json"
        if [[ -f "$FILENAME" ]]; then
            LATENCIES=($(jq -r '.latencies[]' $FILENAME))
            for index in "${!LATENCIES[@]}"; do
                LATENCY_MAP["${region}-${option}-$index"]="${LATENCIES[$index]}"
            done
        else
            echo "File $FILENAME does not exist!"
        fi
    done
done

# Write latencies to CSV, one per row
for i in $(seq 0 99); do
    ROW=""
    for region in $REGIONS; do
        for option in $OPTIONS; do
            KEY="${region}-${option}-$i"
            ROW="${ROW}${LATENCY_MAP[$KEY]},"
        done
    done
    echo ${ROW%,} >> $OUTPUT_FILE
done
