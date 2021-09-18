# Working with the Semantic Theme Generator
The generator expects to find an existing color-theme.json file for all themes defined in `config.json`. as well as a package.json for the project in general.  
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
Here we define the text style 
`bold`
`italic`
`clear`
### **modifierCombinations**
meh
### **alias**
For example Python uses the "builtin" modifier where TypeScript uses a "defaultLibrary" modifier
### **fallbacks**
An object in which Textmate fallbacks for

### **fallbacks**
meh

### **mainTheme**
A boolean value
