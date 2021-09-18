# Working with the Semantic Theme Generator
The generator expects to find an existing `color-theme.json` file for all themes defined in `config.json`. as well as a `package.json` for the project in general.  
## Compiling
After making any modifications to the `config.json` file simply run `node ./generator/generate`.

* The semanticTokenColors property will be fully replaced by the values generated based on the config.  
* Textmate rules defined in tokenColors will be rpelaced or modified based on the fallback definitions in the config but any unrelated TextMate rules will be left intact.  
* All other definitions in the color theme like interface colors are **not** modified.
* The `package.json` file will be updated with the metadata of all configured themes as well as the semanticTokenScopes based on all the Theme's fallback properties.
* 

## The Style Definition Spec

the *config.json* file contains a single main array `themes`

### **path/label/id/uiTheme**  
Theme metadata for VSCode.
 
### **baseTokenColors**  
Each semantic token we want to style starts with a simple base color
### **modifications**  


`"brighten": 3` in the JSON definition resolves to `tinyColor.brighten(3)`  
Besides the default modification we are also able to define modification for specific token types, if the default result doesn't work well with their color.

### **textformatMapping**
A list token types or modifiers mapped to a text formatting definition which can take three boolean properties:  
* `bold`: tokens will be displayed in bold.
* `italic`: tokens will be displayed in italic.
* `clear`: clear any bold/italic styles that other styles might have applied to this token.

### **modifierCombinations**
A list of combinations of two or more token modifiers for which stacked modifications should be generated.  
If left empty only a single modifier like `readonly` or `declaration` will be highlighted at a time, but with `readonly.declaration` defined as a modifier combination a specific style fort his configuration is generated combining the styles of both `readonly` and `declaration`.

### **alias**
A list of semantic token types mapped to a list of other semantic tokens that serve the same role.
For example Python uses the `builtin` modifier where TypeScript uses a `defaultLibrary` modifier. instead of defining the same token styles twice, `builtin` is set as an alias for `defaultLibrary`.

### **fallbacks**
A list of semantic token types with or without modifiers mapped to a list of TextMate scopes that should be highlighted in the same style

### **mainTheme**
A boolean value indicating if a theme is the **primary** theme in a theme pack. 
Does not need to be set if there is only one theme configured.  
Only the statistics of the main theme will be used for README interpolation.

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