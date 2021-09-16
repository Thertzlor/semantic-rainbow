//This file is used to parse the generated style color definitions into a valid
import tinycolor from "tinycolor2";
import { generateColors } from "./lib/colorGenerator.js";
import {readFileSync,writeFile} from "fs";

const configPath = './themes/Semantic Rainbow-color-theme.json'
const cnfString =readFileSync(configPath,'utf-8')
const cnf = JSON.parse(cnfString);
const colorConfig = JSON.parse(readFileSync('./generator/config.json','utf-8'))

const  {semanticRules, fallBackRules} = generateColors(tinycolor,colorConfig);
const {tokenColors} = cnf;

fallBackRules.forEach(({scope})=>
 tokenColors.map((r,i)=>(typeof r.scope === 'string'?scope.includes(r.scope):r.scope.some(i => scope.includes(i)))?{i,r}:null).filter(f=>f).sort((a,b)=>a.i<b.i?1:-1).forEach(({r,i})=>{
       if(scope.includes(r.scope)) return tokenColors.splice(i,1);
       if(scope.every(i=>r.scope.includes(i) && (r.scope.length === scope.length))) return tokenColors.splice(i,1);
       scope.forEach(s=>{
          const subIndex = r.scope.findIndex(e=>e===s);
          if(subIndex !== -1) tokenColors[i].scope = tokenColors[i].scope.splice(subIndex,1)
       })
    })
)

//Deleting the "alias" property from rule definitions
for (const k in semanticRules)((Object.hasOwnProperty.call(semanticRules, k)) && semanticRules[k].alias && delete semanticRules[k].alias)

cnf.semanticTokenColors = semanticRules;
cnf.tokenColors = tokenColors.concat(fallBackRules);

const stringRules = JSON.stringify(cnf,null,3)

if(stringRules !== cnfString)writeFile(configPath,stringRules,'utf8',()=>{console.log('saved config.')})
export {}