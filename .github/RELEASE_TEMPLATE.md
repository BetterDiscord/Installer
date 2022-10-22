<!--
The release pipeline uses this file to draft a github release. (unless that's where you are reading this)
The following literals will be replaced with meaningful values:
    $SHA1                       The full hash of this build's commit.
    $OLD_VERSION                The previous release's (guessed) version number. Reconstructed by reading `package.json`.
    $NEW_VERSION                This release's version number. (sanitized)
    $NAKED_INPUT_VERSION_TAG    Whatever will have been written into the pipeline trigger.
-->

## What's Changed
* New release pipeline by @Inve1951
* .......

<!--
## New Contributors
* @Baits4000 made their first contribution in #7000.
-->

The full list of changes can be viewed at https://github.com/BetterDiscord/Installer/compare/$OLD_VERSION...$NEW_VERSION
