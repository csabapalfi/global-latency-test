#!/usr/bin/env bash

csv1="$1"
csv2="$2"

head -n 1 "$csv1"
tail -n +2 "$csv1"
tail -n +2 "$csv2"
