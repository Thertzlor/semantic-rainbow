# Change Log

All notable changes to the "semantic-rainbow" extension will be documented in this file.
## [1.1.6]
- Slightly more contrasting color for the VSCode Sticky Scroll section and the peekView Editor backround and a third color for the VSCode Sticky Scroll section *within* the peekView Editor. Seriously, Sticky Scroll is an amazing feature.

## [1.1.5]
- Hotfix for a bug introduced in 1.1.4

## [1.1.4]
- Improvements for **lua** syntax highlighting. This specificially targets the lua grammar used by the [sumneko lua language server](https://marketplace.visualstudio.com/items?itemName=sumneko.lua) (which also includes the first language specific color tweak)
- Bug fix for handling `baseToken:language` combinations in the `modifierCombinations` list.

## [1.1.3]
- The color generator now supports generating styles targeting specific languages. As of yet no language specific styles are implemented in the main theme, but examples are bing worked on.
- The README files has been updated with better examples and a new section for language targeting.
- A couple of improvements for **C++** highlighting, potentially more to come.
- Python docstrings no longer look like regular strings.

## [1.1.2]
- Improved support for **Markdown**.

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
