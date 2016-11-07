# How to work on a Jasmine Release

## Development
___Jasmine Core Maintainers Only___

Follow the instructions in `CONTRIBUTING.md` during development.

### Git Rules

Please work on feature branches.

Please attempt to keep commits to `master` small, but cohesive. If a feature is contained in a bunch of small commits (e.g., it has several wip commits or small work), please squash them when merging back to `master`.

### Version

We attempt to stick to [Semantic Versioning](http://semver.org/). Most of the time, development should be against a new minor version - fixing bugs and adding new features that are backwards compatible.

The current version lives in the file `/package.json`. This version will be the version number that is currently released. When releasing a new version, update `package.json` with the new version and `grunt build:copyVersionToGem` to update the gem version number.

This version is used by both `jasmine.js` and the `jasmine-core` Ruby gem.

Note that Jasmine should only use the "patch" version number in the following cases:

* Changes related to packaging for a specific platform (npm, gem, or pip).
* Fixes for regressions.

When jasmine-core revs its major or minor version, the binding libraries should also rev to that version.

## Release

When ready to release - specs are all green and the stories are done:

1. Update the release notes in `release_notes` - use the Anchorman gem to generate the markdown file and edit accordingly
1. Update the version in `package.json` to a release candidate
1. Update any links or top-level landing page for the Github Pages

### Build standalone distribution

1. Build the standalone distribution with `grunt buildStandaloneDist`

### Release the Python egg

1. `python setup.py register sdist upload` You will need pypi credentials to upload the egg.

### Release the Ruby gem

1. Copy version to the Ruby gem with `grunt build:copyVersionToGem`
1. __NOTE__: You will likely need to point to a local jasmine gem in order to run tests locally. _Do not_ push this version of the Gemfile.
1. __NOTE__: You will likely need to push a new jasmine gem with a dependent version right after this release.
1. Push these changes to GitHub and verify that this SHA is green
1. `rake release` - tags the repo with the version, builds the `jasmine-core` gem, pushes the gem to Rubygems.org. In order to release you will have to ensure you have rubygems creds locally.

### Release the NPM

1. `npm adduser` to save your credentials locally
1. `npm publish .` to publish what's in `package.json`

### Release the docs

Probably only need to do this when releasing a minor version, and not a patch version.

1. `cp -R edge ${version}` to copy the current edge docs to the new version
1. Add a link to the new version in `index.html`

### Finally

1. Visit the [Releases page for Jasmine](https://github.com/jasmine/jasmine/releases), find the tag just pushed.
 1. Paste in a link to the correct release notes for this release. The link should reference the blob and tag correctly, and the markdown file for the notes.
 1. If it is a pre-release, mark it as such.
 1. Attach the standalone zipfile


There should be a post to Pivotal Labs blog and a tweet to that link.
