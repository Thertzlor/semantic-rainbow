/**@typedef {{foreground:string,alias?:string|boolean,bold?: boolean, italic?: boolean, underline?: boolean}} ColorRule */
/**@typedef {Record<string,string|ColorRule>} SemanticMap */
/**@typedef {{settings:{foreground:string}}[]} TextMateList*/
/**@typedef {import('../config.json')['themes'][number]} ColorConfig */
/**@typedef {import('tinycolor2')} TinyColorClass*/
/**@typedef {InstanceType<TinyColorClass>} TinyColor*/

/**
 * Generate a set of color rules
 * @param {TinyColorClass} tinycolor the tinycolor library
 * @param {ColorConfig} config The configuration object
 */
const generateColors = (tinycolor, config) => {
   /**@type {Record<string,(color:TinyColor,value:number) => TinyColor>} */
   const specialModifications = {
      alpha: (color, value) => color.setAlpha(color.getAlpha() * value),
      tetrad: (color, value) => color.tetrad()[value],
      triad: (color, value) => color.triad()[value],
      splitcomplement: (color, value) => color.splitcomplement()[value]
   }
   /**@type {Record<string,string | ColorRule>} */
   const semanticRules = {};
   /**@type {{name:string,scope:string[],settings:{foreground:string,fontStyle?:string}}[]} */
   const fallBackRules = [];
   //In this section we compile metadata about the generated colors
   const baseNumber = Object.keys(config.baseTokenColors).length;
   const modNumber = Object.keys(config.modifications).length;
   const extraCombinationsNumber = config.modifierCombinations.length
   const numColors = (baseNumber * modNumber) + (baseNumber * extraCombinationsNumber);
   //Counting modifications and colors that were defined manually.
   const manualColors = ((() => {
      let manualFilters = 0
      for (const f in config.modifications) {
         if (!Object.hasOwnProperty.call(config.modifications, f)) continue;
         const filter = config.modifications[f];
         for (const k in filter) (Object.hasOwnProperty.call(filter, k) && k !== 'default') && manualFilters++
      }
      return baseNumber + modNumber + manualFilters
   })());
   //Putting everything into our "meta" object.
   const meta = {numColors, manualColors, baseNumber, modNumber, extraCombinationsNumber, manualPercent: ((manualColors / numColors) * 100).toFixed(2)}
   /**
    * Transforming a base color using one or more modifications
    * @param {string} base 
    * @param {string[]} variations 
    * @param {string?} [lang]
    */
   const applyColors = (base, variations, lang) => {
      let color = new tinycolor((lang && config.baseTokenColors[`${base}:${lang}`]) || config.baseTokenColors[base])
      variations.forEach(v => {
         const def = (lang && config.modifications[v][`${base}:${lang}`]) || config.modifications[v][base] || (lang && config.modifications[v][`default:${lang}`]) || config.modifications[v].default;
         for (const k in def) ((Object.hasOwnProperty.call(def, k)) && (k in specialModifications ? (color = specialModifications[k](color, def[k])) : color[k](def[k])));
      })
      return color;
   }
   /**Encoding colors into style rules
    * @param {TinyColor} color 
    * @param {string} text 
    * @param {string?} [lang]
    */
   const encode = (color, text, lang) => {
      const finalColor = color[`toHex${color.getAlpha() === 1 ? '' : '8'}String`]();
      const finalText = `${text.replace(/\s+/g, '.')}${lang ? `:${lang}` : ''}`;
      /**@type {string|ColorRule} */
      let rule = finalColor
      //Generating TextMate rules
      const textMateTransform = r => {
         if (typeof rule === 'string') return {foreground: rule};
         let fontText = [];
         if (r.bold) fontText.push('bold');
         if (r.italic) fontText.push('italic');
         if (r.underline) fontText.push('underline');
         if (r.bold === false && r.italic === false && r.underline === false) fontText = [''];
         return {foreground: r.foreground, fontStyle: fontText.join(' ')}
      }
      //Applying text style rules if we find them
      if (config.textformatMapping) for (const f in config.textformatMapping) {
         if (!(Object.hasOwnProperty.call(config.textformatMapping, f) && (new RegExp(`\\b${f}\\b`, 'gm'))).test(finalText)) continue;
         const formatDef = config.textformatMapping[f]
         if (typeof rule === 'string') rule = {foreground: rule};
         if (formatDef.clear) rule = {...rule, bold: false, italic: false, underline: false};
         else rule = {...rule, ...formatDef}
      }
      //Saving the rule
      semanticRules[finalText] = rule;
      //Copying the rule under a different name if the token has an alias
      if (config.alias) for (const k in config.alias) (Object.hasOwnProperty.call(config.alias, k) && (new RegExp(`\\b${k}\\b`, 'gm')).test(finalText)) && config.alias[k].forEach(a => semanticRules[finalText.replace(new RegExp(`\\b${k}\\b`, 'g'), a)] = (typeof rule === 'string' ? {foreground: rule, alias: true} : {...rule, alias: true}))
      //Saving the TextMate fallback rule
      if (config.fallbacks && config.fallbacks[finalText]) fallBackRules.push({name: finalText, scope: config.fallbacks[finalText], settings: textMateTransform(rule)})
   }
   //Iterating over all defined basic tokens
   for (const t in config.baseTokenColors) {
      if (!(Object.hasOwnProperty.call(config.baseTokenColors, t))) return;
      //Saving rule without any modifications
      const [token, lang] = t.split(':')
      encode(new tinycolor(config.baseTokenColors[t]), token, lang);
      //Saving rules for all modifications and all combinations of modifiers
      for (const v in config.modifications) ((Object.hasOwnProperty.call(config.modifications, v)) && encode(applyColors(token, [v], lang), `${token}\n${v}`, lang))
      config.modifierCombinations.map(c => c.split('.')).forEach(c => encode(applyColors(token, c, lang), `${token}\n${c.join(' ')}`, lang))
   }
   return {semanticRules, fallBackRules, meta};
}

/**
 * Ridiculously basic string interpolation to generate dynamic readme and html
 * @param {string} text Text with placeolders
 * @param {Record<string,any>} replacements An object of key/value pairs to be interpolated into the text
 * @returns {string} Text with interpolations
 */
const interpolate = (text, replacements) => {
   let finalText = text
   for (const r in replacements) {
      if (!Object.prototype.hasOwnProperty.call(replacements, r)) continue;
      finalText = finalText.replace(new RegExp(`\{${r}\}`, 'gim'), replacements[r])
   }
   return finalText;
}

//The following section contains code meant to enable the reuse of color names within config files. This is not implemented yet.

/**
 * Checks if the value of a color property is a proper color value (string or hex) or a reference to an existing color name in the colors object
 * @param {Record<string,string>} values 
 * @returns {(name:string)=>boolean} bla
 */
const isColorVar = values => name => (!name.startsWith('#')) && name.includes('.') && name in values

/**
 * resolves color variables into actual colors
 * @param {{tokenColors?:TextMateList,semanticTokenColors?:SemanticMap}} dynamicValues 
 * @param {Record<string,string>} staticValues 
 */
const resolveColors = (dynamicValues, staticValues) => {
   const cv = isColorVar(staticValues)
   dynamicValues?.tokenColors.forEach(t => {
      if (cv(t.settings.foreground)) t.settings.foreground = staticValues[t.settings.foreground]
   })

   for (const k in dynamicValues?.semanticTokenColors ?? {}) {
      if (Object.hasOwnProperty.call(dynamicValues.semanticTokenColors, k)) {
         const element = dynamicValues.semanticTokenColors[k];
         if (typeof element === 'string') {
            if (cv(element)) dynamicValues.semanticTokenColors[k] = staticValues[element]
         }
         else if (cv(element.foreground)) element.foreground = staticValues[element.foreground]
      }
   }
}

export {generateColors, interpolate, resolveColors}