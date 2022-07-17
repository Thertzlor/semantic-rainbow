//This file is used to merge the generated style rules with the actual VSCode theme definition as well as outputting the readme and modifying package.json
import tinycolor from "tinycolor2";
import {generateColors, interpolate} from "./lib/colorGenerator.js";
import {readFileSync, writeFile, existsSync} from "fs";
import {relative, parse} from "path"
const initialDirectory = process.cwd();
//Defining paths and reading files
const packageData = JSON.parse(readFileSync("package.json", 'utf-8'))
const {themes, readmePath, readmeTemplatePath} = JSON.parse(readFileSync('./generator/config.json', 'utf-8'))
const readme = readmePath && readmeTemplatePath && readFileSync(readmeTemplatePath, 'utf-8');
//re-initializing the properties of the package.json that will be dynamically populated.
packageData.contributes.semanticTokenScopes = [];
packageData.contributes.themes = [];
//iterating over all color themes in the config 
themes.forEach(t => {
   const {id, label, uiTheme, path, fallbacks, mainTheme, colorPath} = t;
   //Inserting theme metadata into package.json
   packageData.contributes.themes.push({id, label, uiTheme, path})
   //Contributing semantic token scopes. Not sure if this actually does anything.
   packageData.contributes.semanticTokenScopes.push({scopes: fallbacks})
   //Generating updated color values.
   const {semanticRules, fallBackRules, meta} = generateColors(tinycolor, t);
   //Reading the theme definition JSON
   const cnf = JSON.parse(readFileSync(path, 'utf-8'));
   //fetching color info
   let colorCation = colorPath
   if (!colorPath) {
      const {name, ext} = parse(path)
      colorCation = `./colors/${name}${ext}`
   }
   const colorInfo = existsSync(colorCation) ? JSON.parse(readFileSync(colorCation, 'utf-8')) : {}
   const {tokenColors} = cnf;
   //Here we deal with existing textmate rules that might interfere with the fallbacks that were generated
   fallBackRules.forEach(({scope}) => tokenColors.map((r, i) => (typeof r.scope === 'string' ? scope.includes(r.scope) : r.scope.some(i => scope.includes(i))) ? {i, r} : null).filter(f => f).sort((a, b) => a.i < b.i ? 1 : -1).forEach(({r, i}) => {
      //Deleting existing textmate rules that contradict our fallback rules
      if (scope.includes(r.scope)) return tokenColors.splice(i, 1);
      if (scope.every(i => r.scope.includes(i) && (r.scope.length === scope.length))) return tokenColors.splice(i, 1);
      //If any textmate rules contains individual scopes that are covered by our fallbacks they will be removed from the rule
      scope.forEach(s => {
         const subIndex = r.scope.findIndex(e => e === s);
         if (subIndex !== -1) tokenColors[i].scope = tokenColors[i].scope.splice(subIndex, 1)
      })
   })
   )
   //Deleting the "alias" property from rule definitions, since it is not necessary for vscode
   for (const k in semanticRules) ((Object.hasOwnProperty.call(semanticRules, k)) && semanticRules[k].alias && delete semanticRules[k].alias)
   //Updating the color theme with the new values
   cnf.semanticTokenColors = semanticRules;
   cnf.tokenColors = tokenColors.concat(fallBackRules);
   if (colorInfo && colorInfo.colors) {cnf.colors = colorInfo.colors}
   const stringRules = JSON.stringify(cnf, null, 3);
   //Updating the readme with color stats if it's the main Theme
   const pathDiff = (relative(parse(readmeTemplatePath).dir, parse(readmePath).dir))
   const finalReadme = (mainTheme || themes.length === 1) && readme && interpolate(readme, meta).replace(/\]\((?!http)([^)]+)\)/gmi, (_, c) => (`](${relative(pathDiff, c).replace(/\\/gm, '/')})`));
   process.chdir(initialDirectory)
   //Saving the files
   writeFile(path, stringRules, 'utf8', () => {console.log('saved config.')});
   finalReadme && writeFile(readmePath, finalReadme, 'utf8', () => console.log('saved readme.'));
})
//Saving the package  json with all the theme info
writeFile("package.json", JSON.stringify(packageData, null, 3), 'utf8', () => console.log('saved package'))
export { }