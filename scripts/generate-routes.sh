#!/usr/bin/env bash

regions=(arn1 bom1 cdg1 cle1 cpt1 dub1 fra1 gru1 hkg1 hnd1 iad1 icn1 kix1 lhr1 pdx1 sfo1 sin1 syd1)

for region in "${regions[@]}"; do
  mkdir -p "app/api/$region"
  region=$region envsubst < "app/templates/[region]/route.template.js"  > "app/api/$region/route.js" 
done