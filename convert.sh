#!/usr/bin/env bash

# Check if file argument is provided
if [[ $# -ne 1 ]]; then
    echo "Usage: $0 <latencies_file.csv>"
    exit 1
fi

# Input CSV file
INPUT_FILE="$1"
if [[ ! -f $INPUT_FILE ]]; then
    echo "File $INPUT_FILE does not exist!"
    exit 1
fi

# Output CSV file
OUTPUT_FILE="${INPUT_FILE%.*}_transformed.csv"

# List of regions and options
REGIONS="arn1 bom1 cdg1 cle1 cpt1 dub1 fra1 gru1 hkg1 hnd1 iad1 icn1 kix1 lhr1 pdx1 sfo1 sin1 syd1"
OPTIONS="current serverless edge"

# Create header for the new CSV
echo "region,option,latency" > $OUTPUT_FILE

# Read the input CSV file line by line, skipping the header
tail -n +2 "$INPUT_FILE" | while IFS= read -r line; do
    # Split the line into its latency values
    IFS=',' read -ra LATENCIES <<< "$line"

    # Initialize index to track which region and option we're processing
    index=0
    for region in $REGIONS; do
        for option in $OPTIONS; do
            latency=${LATENCIES[$index]}
            echo "$region,$option,$latency" >> $OUTPUT_FILE
            index=$((index+1))
        done
    done
done
