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

    next)
      cd "$project_name"
      npm install
      npm run build
      cd -
      ;;

    nuxt)
      cd "$project_name"
      npm install
      npm run build
      cd -
      ;;

    vue-typescript)
      cd "$project_name"
      npm install
      npm run build
      cd -
      ;;

    vue-vuex)
      cd "$project_name"
      npm install
      npm run build
      cd -
      ;;

    parcel)
      cd "$project_name"
      npm install
      npm run build
      cd -
      ;;

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
