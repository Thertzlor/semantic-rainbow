//This file is used to merge the generated style rules with the actual VSCode theme definition as well as outputting the readme
import tinycolor from "tinycolor2";
import { generateColors, interpolate } from "./lib/colorGenerator.js";
import {readFileSync,writeFile} from "fs";
//Defining paths and reading files
const configPath = './themes/Semantic Rainbow-color-theme.json';
const readmeTemplatePath ='./generator/_Template.md';
const readmePath ="./README.md"
const colorConfig = JSON.parse(readFileSync('./generator/config.json','utf-8'))
const cnf =JSON.parse(readFileSync(configPath,'utf-8'));
const readme = readFileSync(readmeTemplatePath,'utf-8');
//Generating updated color values.
const  {semanticRules, fallBackRules, meta} = generateColors(tinycolor,colorConfig);
const {tokenColors} = cnf;
//Here we deal with existing textmate rules that might interfere with the fallbacks that were generated
fallBackRules.forEach(({scope}) => tokenColors.map((r,i)=>(typeof r.scope === 'string'?scope.includes(r.scope):r.scope.some(i => scope.includes(i)))?{i,r}:null).filter(f=>f).sort((a,b)=>a.i<b.i?1:-1).forEach(({r,i})=>{
      //Deleting existing textmate rules that contradict our fallback rules
      if(scope.includes(r.scope)) return tokenColors.splice(i,1);
      if(scope.every(i=>r.scope.includes(i) && (r.scope.length === scope.length))) return tokenColors.splice(i,1);
      //If any textmate rules contains individual scopes that are covered by out fallbacks they will be removed from the rule
      scope.forEach(s=>{
         const subIndex = r.scope.findIndex(e=>e===s);
         if(subIndex !== -1) tokenColors[i].scope = tokenColors[i].scope.splice(subIndex,1)
      })
   })
)
//Deleting the "alias" property from rule definitions
for (const k in semanticRules)((Object.hasOwnProperty.call(semanticRules, k)) && semanticRules[k].alias && delete semanticRules[k].alias)
//Updating the color theme with the new values
cnf.semanticTokenColors = semanticRules;
cnf.tokenColors = tokenColors.concat(fallBackRules);
const stringRules = JSON.stringify(cnf,null,3);
//Updating the readme with color stats
const finalReadme = interpolate(readme,meta).replace(/\]\(\.\./gmi,'](.');
//Saving the files
writeFile(configPath,stringRules,'utf8',()=>{console.log('saved config.')});
writeFile(readmePath,finalReadme,'utf8',()=>console.log('saved readme.'));
export {}