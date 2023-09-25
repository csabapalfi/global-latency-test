#!/usr/bin/env bash

URLS="$1"
DEST="$2"
COUNT=50
PARALLEL=3
HEADERS=false
API="https://global-latency-test-csaba.vercel.app/api"

mkdir -p "$DEST"

while IFS=$'\t' read -r url label; do
  for region in arn1 bom1 cdg1 cle1 cpt1 dub1 fra1 gru1 hkg1 hnd1 iad1 icn1 kix1 lhr1 pdx1 sfo1 sin1 syd1; do
    echo "${region}-${label}"
    curl --silent "${API}/${region}?label=${label}&url=${url}&parallel=${PARALLEL}&count=${COUNT}&headers=${HEADERS}" | jq . > "${DEST}/${region}-${label}.json"
  done
done < "$URLS"
