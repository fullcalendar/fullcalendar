#!/usr/bin/env bash

# always immediately exit upon error
set -e

cd "`dirname $0`/../example-projects"

for package_file in */package.json
do
  project_name="$(dirname $package_file)"

  case "$project_name" in

    angular)
      echo "SKIPPING $project_name FOR NOW" ;;
    next)
      echo "SKIPPING $project_name FOR NOW" ;;
    nuxt)
      echo "SKIPPING $project_name FOR NOW" ;;
    react)
      echo "SKIPPING $project_name FOR NOW" ;;
    react-mobx-typescript)
      echo "SKIPPING $project_name FOR NOW" ;;
    react-redux)
      echo "SKIPPING $project_name FOR NOW" ;;
    react-typescript)
      echo "SKIPPING $project_name FOR NOW" ;;
    vue)
      echo "SKIPPING $project_name FOR NOW" ;;
    vue-typescript)
      echo "SKIPPING $project_name FOR NOW" ;;
    vue-vuex)
      echo "SKIPPING $project_name FOR NOW" ;;
    parcel)
      echo "SKIPPING $project_name FOR NOW" ;;

    *)
      cd "$project_name"
      yarn build
      cd -

    # yarn pnpify --cwd angular yarn build

  esac

done
