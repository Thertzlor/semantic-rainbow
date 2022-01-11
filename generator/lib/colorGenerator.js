
/**
 * Generate a set of color rules
 * @param {any} tinycolor the tinycolor library
 * @param {any} config The configuration object
 */
const generateColors = (tinycolor, config) => {

   const specialModifications = {
      alpha(color, value) {
         return color.setAlpha(color.getAlpha() * value);
      },
      tetrad(color, value) {
         return color.tretrad()[value]
      },
      triad(color, value) {
         return color.triad()[value]
      },
      splitcomplement(color, value) {
         return color.splitcomplement()[value]
      },
   }

   const semanticRules = {};
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
   //Transforming a base color using one or more modifications
   const applyColors = (base, variations) => {
      let color = new tinycolor(config.baseTokenColors[base])
      variations.forEach(v => {
         const def = config.modifications[v][base] || config.modifications[v].default;
         for (const k in def) ((Object.hasOwnProperty.call(def, k)) && (k in specialModifications ? (color = specialModifications[k](color, def[k])) : color[k](def[k])));
      })
      return color;
   }
   //Encoding colors into style rules
   const encode = (color, text) => {
      const finalColor = color[`toHex${color.getAlpha() === 1 ? '' : '8'}String`]();
      const finalText = text.replace(/\s+/g, '.');
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
      encode(new tinycolor(config.baseTokenColors[t]), t)
      //Saving rules for all modifications and all combinations of modifiers
      for (const v in config.modifications) ((Object.hasOwnProperty.call(config.modifications, v)) && encode(applyColors(t, [v]), t + '\n' + v))
      config.modifierCombinations.map(c => c.split('.')).forEach(c => encode(applyColors(t, c), t + '\n' + c.join(' ')))
   }
   return {semanticRules, fallBackRules, meta};
}

/**
 * Ridiculously basic string interpolation to generate dynamic readme and html
 * @param {string} text Text with placeolders
 * @param {Record<string,any>} replacements An object of key/value pairs to be interpolated into the text
 * @returns 
 */
const interpolate = (text, replacements) => {
   let finalText = text
   for (const r in replacements) {
      if (!Object.prototype.hasOwnProperty.call(replacements, r)) continue;
      finalText = finalText.replace(new RegExp(`\{${r}\}`, 'gim'), replacements[r])
   }
   return finalText;
}

export {generateColors, interpolate}