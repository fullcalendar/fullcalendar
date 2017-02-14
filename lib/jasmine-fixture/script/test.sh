#!/usr/bin/env bash

set -e

echo "<----- browser - jasmine 1.x - jq 1.8 - 'lineman spec-ci'"
lineman spec-ci

echo "<----- browser - jasmine 2.x - jq 1.8 - 'lineman spec-ci -- -f config/spec-jasmine2.json'"
lineman spec-ci -- -f config/spec-jasmine2.json

echo "<----- browser - jasmine 1.x - jq 1.11 - 'lineman spec-ci -- -f config/spec-jq-1.11.json'"
lineman spec-ci -- -f config/spec-jq-1.11.json

echo "<----- browser - jasmine 1.x - jq 2.1 - 'lineman spec-ci -- -f config/spec-jq-2.1.json'"
lineman spec-ci -- -f config/spec-jq-2.1.json

echo "<----- node - jasmine 1.x - 'MAJOR_JASMINE_VERSION=1 lineman grunt nodeSpec'"
MAJOR_JASMINE_VERSION=1 lineman grunt nodeSpec

echo "<----- node - jasmine 2.x - 'MAJOR_JASMINE_VERSION=2 lineman grunt nodeSpec'"
MAJOR_JASMINE_VERSION=2 lineman grunt nodeSpec
