# Change Log

All notable changes to the "semantic-rainbow" extension will be documented in this file.

## [1.1.1]
- Better contrast between comments and the the background color for added lines in the git diff editor.
- A more subtle purple for snippet tab-stops.
- Less unnecessary files included in production release.

## [1.1.0]
- A major update!
- Different kind of VSCode selections and ranges now have different colors, see the Github page for examples.
- In order to give the colored selections more "breathing room" the editor background color was changed to a darker, slightly less saturated color from #191A26 to #14151A. I hope this change isn't too upsetting and of course you can always override it by manually setting the `editor.background` color to the old value in the VSCode settings.
- Workbench colors can now be defined in a separate JSON in the `colors` folder.
- A few better token definitions designed to work with the sumneko lua extension.

## [1.0.5]
- Better coloring for Bash commands and variables.
- Fixed typos documentation.

## [1.0.4]
- New color for `super` keyword, closer to `this`
- Fixed typo in changelog.

## [1.0.3]
- Tweaked YAML highlighting to match JSON
- TextMate fallbacks for `nil` keyword and builtin classes
- new alias: declaration = definition (for Go)
- Badges in README because why not

## [1.0.2]
- The `in` keword in Python is now correctly highlighted in purple.
- More examples in the README
- Layout tweaks on the Github page

## [1.0.1]
- Just fixing some broken links in the README

## [1.0.0]
- Initial release
