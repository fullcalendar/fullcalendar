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
      # uses vue-cli-service, which is webpack 4
      echo "SKIPPING $project_name FOR NOW" ;;

    vue-vuex)
      # uses vue-cli-service, which is webpack 4
      echo "SKIPPING $project_name FOR NOW" ;;

    next)
      # problems ignoring fc's CSS files. can't ignore
      echo "SKIPPING $project_name FOR NOW" ;;

    nuxt)
      # nuxt cli uses webpack 4
      echo "SKIPPING $project_name FOR NOW" ;;

    parcel)
      # parcel just doesn't support pnp
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
