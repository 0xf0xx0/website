#!/bin/bash
set -eu

hash=$(git rev-parse HEAD | head -c 7)
out="./.out/$hash"

node ./build.js
mkdir -pv "./.out/$hash"
cp -rv ./site/* ./site/.* "$out"
rm -rv "$out/src/views"
rm -v "$out/src/scripts/fast-blurhash.js"
cp -v "./node_modules/fast-blurhash/index.js" "$out/src/scripts/fast-blurhash.js"
cd "$out/src/styles"
cleancss -b --batch-suffix "" --inline none ./*
