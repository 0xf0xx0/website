#!/bin/bash
set -eu

hash=$(git rev-parse HEAD | head -c 7)
out="./.out/$hash"

node ./build.js
mkdir -pv "./.out/$hash"
cp -rv ./site/* ./site/.* "$out"
rm -rv "$out/src/views"