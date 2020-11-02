#!/usr/bin/env bash

# always immediately exit upon error
set -e

cd "`dirname $0`/../example-projects"

for package_file in */package.json
do
  project_name="$(dirname $package_file)"

  echo "-------"
  echo "PROJECT: $project_name"
  echo "-------"

  case "$project_name" in

    vue-typescript)
      echo "SKIPPING $project_name FOR NOW" ;;
    vue-vuex)
      echo "SKIPPING $project_name FOR NOW" ;;
    next)
      echo "SKIPPING $project_name FOR NOW" ;;
    nuxt)
      echo "SKIPPING $project_name FOR NOW" ;;
    parcel)
      echo "SKIPPING $project_name FOR NOW" ;;

    angular)
      yarn pnpify --cwd angular yarn build
      ;;

    *)
      cd "$project_name"
      yarn build
      cd -
      ;;

  esac

done
