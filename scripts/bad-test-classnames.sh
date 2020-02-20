#!/usr/bin/env bash

# the quote craziness in the regex is simply to get ['"]
find packages*/__tests__/src -type f -not -name '*Wrapper.*' -not -name '*.tsx' -print0 | xargs -0 \
  grep --color=auto -E 'fc\-'

  # to search for ALL selectors...
  # '(\$|find|querySelector|querySelectorAll)\(['"'"'"]'

# afterwards, manually search for '.fc' (making regex was too hard)
