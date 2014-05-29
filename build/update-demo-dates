#!/usr/bin/env bash

read -p "Enter new year (4 digits): " year
read -p "Enter new month (2 digits): " month
read -p "This will modify files in the demos folder, is that ok? (y/n): " yn

if [[ $yn != "y" ]]
then
	exit
fi

find "`dirname $0`/../demos" -type f \( -name '*.html' -o -name '*.json' \) -print0 \
| xargs -0 sed -i '' -e "s/[0-9][0-9][0-9][0-9]-[0-9][0-9]/$year-$month/g"

echo "DONE"