# Working with the Semantic Theme Generator
Modifying Semantic Rainbow or generating your own dynamic semantic hightlighting theme is easy, simply edit the `config.json` file in this directory.  
But if you start from scratch, note that this generator expects to find an existing `color-theme.json` definition for all themes defined in `config.json`, as well as a `package.json` for the project in general.  
## Compiling
After making any modifications to the `config.json` file simply run `node ./generator/generate`.
The generator will apply the following changes to the color theme definition and package.json:

* The semanticTokenColors property will be fully replaced by the values generated based on the config.  
* Textmate rules defined in tokenColors will be rpelaced or modified based on the fallback definitions in the config but any unrelated TextMate rules will be left intact.  
* The static colors of your theme for the workbench and other parts of VSCode can be defined in the `colors` folder via another VSCode theme JSON file with the same name as the final output in the `themes`. Only the "colors" property will be merged into the final theme. This helps keeping manual changes to the programmatic output to a minimum.
* All other definitions in the color theme are **not** modified and can be set directly in the `themes` folder.
* The `package.json` file will be updated with the metadata of all configured themes as well as the semanticTokenScopes based on all the Theme's fallback properties.
* If the required paths are provided a number statistics can be [interpolated into your README](#readme-interpolation).

## The Style Definition Spec
Themes can be defined in the `config.json` file. The provided json schema file should provide a good enough guide on the structure, so the descriptions provided here will be more general than technical.

### **path/label/id/uiTheme**  
Theme metadata for VSCode to be inserted into `package.json`.  
See the [VSCode Contribution points documentation](https://code.visualstudio.com/api/references/contribution-points#contributes.themes)
 
### **baseTokenColors**  
Each semantic token we want to style starts with a simple base color, assigned to a list of [standard tokens](https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide#standard-token-types-and-modifiers).  
Here a simplified example that colors variables red, classes green and functions blue:
```JSON
 "baseTokenColors": {
   "variable": "#ff0000",
   "class": "#00ff00",
   "function": "#0000ff",
}
```
You can additionally define [different colors for specific languages](#handling-language-specific-styles).

### **modifications**
A list of color modifications that will be applied with specific token modifiers.
Each modifier needs a `default` modification and can additionally have other modifier definitions for specific token types, if the default doesn't work well with their base color for example.

The generator uses [TinyColor](https://github.com/bgrins/TinyColor) for transforming color values and most of the color modifications work as described in the [TinyColor Documentation](https://github.com/bgrins/TinyColor#color-modification) with the provided value being used as the argument. `"brighten": 10` in the JSON definition resolves to `color.brighten(10)` 

In the case of the `triad` and `tetrad` modifications the number provided in the JSON acts as an array index and decides which of the resulting values should be chosen from the method's return value.

The `alpha` modification works a bit differently than the `setAlpha` method in tinyColor which sets an absolute alpha value. `alpha` instead sets the alpha relative to the current alpha of the color so the that effect can be stacked.

A simple example of a modifier definition:
```JSON
{
   "readonly":{
      "default":{
         "darken":10
      },
      "function":{
         "darken":20
      }
   }
}
```
The above example defines that all readonly tokens will have their color darkened by 10%, but all readonly *functions* will be darkened twice as much with an amount of 20. 

### **textformatMapping**
A list token types or modifiers mapped to a text formatting definition which can take three boolean properties:  
* `bold`: tokens will be displayed in bold.
* `italic`: tokens will be displayed in italic.
* `underline`: tokens will be underlined.
* `clear`: clear any bold/italic/underline styles that other styles might have applied to this token.

The following example defines that any token of type `class` should be formatted in bold and all declarations in italics:
```JSON
"textformatMapping": {
   "class": {
      "bold": true
   },
   "declaration": {
      "italic": true
   }
}
```
The formatting also extends to all "child" styles of `class` such as for example `class.defaultLibrary`.  
Formatting styles also stack, here a token identified as `class.declaration` will be bold as well as italic. 
### **modifierCombinations**
A list of combinations of two or more token modifiers for which stacked modifications should be generated.  
If left empty only a single modifier like `readonly` or `declaration` will be highlighted at a time, but with `readonly.declaration` defined as a modifier combination a specific style fort his configuration is generated combining the styles of both `readonly` and `declaration`.

### **alias**
A list of semantic token types mapped to a list of other semantic tokens that serve the same role.
For example Python uses the `builtin` modifier where TypeScript uses a `defaultLibrary` modifier. instead of defining the same token styles twice, `builtin` is set as an alias for `defaultLibrary`.
```JSON
"alias": {
   "defaultLibrary": [
      "builtin"
   ]
}
```
### **defaultLanguages**
An optional array of [VSCode language identifiers](https://code.visualstudio.com/docs/languages/identifiers) for which all possible color tokens should be generated. For details see [language specific styles](#handling-language-specific-styles).

### **fallbacks**
A list of semantic token types with or without modifiers mapped to a list of TextMate scopes that should be highlighted in the same style.

***Important**: If you generate multiple themes VSCode cannot distinguish which semantic token scopes originate from which theme and will always use all scopes combined. This is a basic limitation and can only be solved by turning the themes into separate extensions.*

### **mainTheme**
A boolean value indicating if a theme is the **primary** theme in a theme pack. 
Does not need to be set if there is only one theme configured.  
Only the statistics of the main theme will be used for README interpolation.

## Handling language specific styles
As of version 1.1.3 Semantic Rainbow supports different colors and transformations for different languages, using the standard VSCode syntax for semantic tokens of appending a [language identifier](https://code.visualstudio.com/docs/languages/identifiers) after a colon.
```JSON
 "baseTokenColors": {
   "variable": "#ff0000",
   "variable:java": "#00ff00"
}
```
Here, we define that variables should be highlighted in red by default, but in green for variables in Java.  
All following color modifications in Java will be applied to the new green base color as well. Modifications can of course also be defined per language in the same way:
 ```JSON
{
   "readonly":{
      "default":{
         "darken":10
      },
      "variable:java":{
         "darken":20
      }
   }
}
```
With this setting our newly declared token color for Java variables will be dimmed 10% more by the `readonly` modification, compared to variables in other languages.  

However, since modifier variations for different languages can quickly bloat the theme, the generator takes a more conservative approach when initializing them. Simply declaring a language variation in the `modifiers` option won't output it unless it is explicitly referenced in another part of the theme in one of the following ways:
* A separate `baseTokenColor` is defined for the token/language combination as shown above.
* The token/language combination is explicitly declared as a an entry in `modifierCombinations`.
* The language identifier is included in the `defaultLanguages` list, in which case all available tokens for that language will be generated.

This makes it possible to be more selective about which tokens and modifiers change for each language. If a language specific `modifierCombination` is references all "descendant" combinations will share the language specific modification.
So if `variable:java` is defined in the list, the token for `variable.readonly:java` will also be affected by Java specific changes

### Note regarding language specific TextMate fallbacks
Language specific styles extend to fallbacks. If we have defined the textmate scope `variable.parameter` as fallback for the semantic token `parameter`, and we add a specific color for parameters in Kotlin via a `parameter:kotlin` entry in our `baseTokenColors` list, an additional textMate rule for this new color will be created automatically.  
This rule will target Kotlin files via TextMate descendant selectors like this: `"source.kotlin variable.parameter"`.

This works well, however in order to guarantee that no other textMate rules conflict with the newly generated fallbacks, **Semantic Rainbow** will delete all existing textMate rules that start with the `"source.[language] "` pattern.
If your base theme included such rules, either rewrite them as semantic token fallbacks so the generator can manage them, or if that's not possible but you really **need** to override that token, make the selector target the language at the *end*.  
A manually defined rule for `"source.kotlin variable"` will be removed, but `"variable.kotlin"` will stay.

## README interpolation
The generator outputs a number of statistics about the current main theme:
* *numColors*: The total number of color styles generated.
* *baseNumber*: The number of basic semantic token types styled.
* *modNumber*: the number of modifications defined for token modifiers.
* *extraCombinationsNumber*: The number of valid modifier combinations defined.
* *manualColors*: The number of styles defined manually, this includes base colors and all modifications.
* *manualPercent*: The percentage of manually defined styles and filters in the theme compared to automated styles.

Since these numbers can fluctuate between releases and I always want up-to-date stats in my README, Semantic Rainbow includes a basic interpolation utility. Simply provide a template markdown file with any of the variable names listed above in brackets, and the variables will be filled in and saved as your finished README.  

This:
```Markdown
About {manualPercent}% of styles/transformations are manually defined
```
Becomes:
```Markdown
About 8.63% of styles/transformations are manually defined
```
[And don't worry: any links to relative paths in the Template will automatically relativized]  

To activate readme interpolation fill in the following two properties in the root of the `config.json` file:

### **readmeTemplatePath**
The path of the template README file.
### **readmePath**
The path where the README file with the interpolated value will be stored.
### **parent**
The `id` of another theme defined in the same configuration file, used to create themes that are variations of other themes.  
Any options that are either not present or null on the current theme definition will be copied from the parent definition.  
If an option is an object or array it will be combined with the parent's value. Again, any property that isn't present or defined on the child option will be copied over from the parent's option.  