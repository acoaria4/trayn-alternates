import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';

const folder = new URL('../', import.meta.url);
const input = JSON.parse(await readFile(new URL('costing/prototype-inputs.json', folder), 'utf8'));
const sum = values => values.reduce((a, b) => a + b, 0);
const close = (actual, expected, label) => assert(Math.abs(actual - expected) < 1e-8, `${label}: ${actual} != ${expected}`);
// Remove sub-paise floating-point noise before rounding displayed INR amounts.
const money = number => (Math.round((number + 1e-9) * 100) / 100).toFixed(2);
const servingsPerTin = input.tinNetGrams / input.servingGrams;
assert.equal(servingsPerTin, 15);
assert.equal(input.scenarios.length, 3);
assert(input.servingGrams > 0 && input.saleableTinsPerRoute > 0 && input.tinFillOverageGrams >= 0);
for (const ingredient of Object.values(input.ingredients)) {
  assert(ingredient.proteinFraction >= 0 && ingredient.proteinFraction <= 1);
  assert.equal(ingredient.rates.length, 3);
  assert(ingredient.rates.every(rate => Number.isFinite(rate) && rate > 0));
}
for (const scenario of input.scenarios) {
  assert(scenario.ingredientLoss >= 0 && scenario.ingredientLoss < 1);
  assert(scenario.packagingRejectFraction >= 0 && scenario.packagingRejectFraction < 1);
}
const fillFactor = (input.tinNetGrams + input.tinFillOverageGrams) / input.tinNetGrams;

function calculate(prototype, scenarioIndex, tinGrams = input.tinNetGrams) {
  const scenario = input.scenarios[scenarioIndex];
  const count = input.saleableTinsPerRoute;
  const servings = tinGrams / input.servingGrams;
  const fill = (tinGrams + input.tinFillOverageGrams) / tinGrams;
  const ingredientLines = Object.entries(prototype.grams).map(([id, grams]) => ({ id, grams, ratePerKg: input.ingredients[id].rates[scenarioIndex], cost: grams * input.ingredients[id].rates[scenarioIndex] / 1000 }));
  const nominalIngredients = sum(ingredientLines.map(line => line.cost));
  const fillOverage = nominalIngredients * (fill - 1);
  const processLoss = nominalIngredients * fill * scenario.ingredientLoss / (1 - scenario.ingredientLoss);
  const packagingSets = Math.ceil(count / (1 - scenario.packagingRejectFraction));
  const packagingSetCost = sum(input.packaging.map(component => component.rates[scenarioIndex]));
  const packaging = packagingSets * packagingSetCost / count / servings;
  const conversion = input.servingGrams / 1000 * fill * scenario.conversionPerKg;
  const routineQa = scenario.routineQaPerBatch / (count * servings);
  const inboundStorage = scenario.inboundStoragePerServing;
  const beforeContingency = nominalIngredients + fillOverage + processLoss + packaging + conversion + routineQa + inboundStorage;
  const contingency = beforeContingency * scenario.contingencyFraction;
  const recurring = beforeContingency + contingency;
  return { scenario: scenario.name, ingredientLines, nominalIngredients, fillOverage, processLoss, packagingSetCost, packagingSets, packaging, conversion, routineQa, inboundStorage, contingency, recurringPerServing: recurring, recurringPerTin: recurring * servings, recurringBatch: recurring * servings * count, grossIngredientBatchKg: count * (tinGrams + input.tinFillOverageGrams) / 1000 / (1 - scenario.ingredientLoss) };
}

const results = input.prototypes.map(prototype => {
  close(sum(Object.values(prototype.grams)), input.servingGrams, `${prototype.id} serving mass`);
  const protein = sum(Object.entries(prototype.grams).map(([id, grams]) => grams * input.ingredients[id].proteinFraction));
  close(protein, input.calculatedMainProteinGrams, `${prototype.id} calculated protein`);
  const batchGrams = Object.fromEntries(Object.entries(prototype.grams).map(([id, grams]) => [id, grams / input.servingGrams * 1000]));
  close(sum(Object.values(batchGrams)), 1000, `${prototype.id} bench batch`);
  if (prototype.id !== 'R1') {
    const proteinLines = Object.entries(prototype.grams).filter(([id]) => input.ingredients[id].proteinFraction > 0);
    close(proteinLines[0][1] * input.ingredients[proteinLines[0][0]].proteinFraction / protein, .7, `${prototype.id} protein split`);
  }
  const scenarios = input.scenarios.map((_, i) => calculate(prototype, i));
  assert(scenarios[0].recurringPerServing < scenarios[1].recurringPerServing);
  assert(scenarios[1].recurringPerServing < scenarios[2].recurringPerServing);
  const base = scenarios[1];
  const packagingSetupPerServing = input.oneOff.packagingSetupPerSelectedSku / (input.saleableTinsPerRoute * servingsPerTin);
  const developmentPerServing = input.oneOff.sharedDevelopmentProgramme / (input.saleableTinsPerRoute * servingsPerTin);
  return { id: prototype.id, name: prototype.name, conditionalYeastPrice: Boolean(prototype.conditionalYeastPrice), calculatedMainProteinGrams: protein, activeSucraloseMg: prototype.grams.sweetener * input.sweetenerActiveFraction * 1000, fibreIngredientContributionGrams: prototype.grams.fibre * input.fibreFractionAssumption, batchGrams, scenarios, firstLaunchPerServing: base.recurringPerServing + packagingSetupPerServing + developmentPerServing, packagingSetupPerServing, developmentPerServing, fiveHundredGramTin: calculate(prototype, 1, 500) };
});
for (const result of results) close(result.activeSucraloseMg, 12, `${result.id} active sweetener`);
const report = { date: input.date, status: input.status, currency: input.currency, servingGrams: input.servingGrams, tinNetGrams: input.tinNetGrams, servingsPerTin, saleableTinsPerRoute: input.saleableTinsPerRoute, fillFactor, exclusions: ['recoverable GST', 'outbound fulfilment', 'selling fees and distributor margin', 'marketing', 'business overhead', 'clinical efficacy studies'], results };

// Only calculated blocks in the human-readable specification are regenerated.
const specUrl = new URL('radiance-product-spec.md', folder);
let spec = await readFile(specUrl, 'utf8');
const table = (headers, rows) => [headers, headers.map(() => '---'), ...rows].map(row => `| ${row.join(' | ')} |`).join('\n');
function replaceBlock(name, content) {
  const start = `<!-- ${name}:start -->`;
  const end = `<!-- ${name}:end -->`;
  assert(spec.includes(start) && spec.includes(end), `Missing ${name} block`);
  spec = spec.slice(0, spec.indexOf(start) + start.length) + '\n' + content + '\n' + spec.slice(spec.indexOf(end));
}
const ingredientIds = Object.keys(input.ingredients);
replaceBlock('formula', table(['Ingredient in g per 34 g serving', ...results.map(r => r.id)], ingredientIds.map(id => [input.ingredients[id].name, ...input.prototypes.map(p => (p.grams[id] || 0).toFixed(3))]).concat([['Total', ...results.map(() => '34.000')], ['Calculated main protein', ...results.map(r => r.calculatedMainProteinGrams.toFixed(3))]])));
replaceBlock('bench', table(['Ingredient in g per 1 kg batch', ...results.map(r => r.id)], ingredientIds.map(id => [input.ingredients[id].name, ...results.map(r => (r.batchGrams[id] || 0).toFixed(3))]).concat([['Total before rounding', ...results.map(() => '1000.000')]])));
replaceBlock('rates', table(['Ingredient', 'Low INR/kg', 'Base INR/kg', 'High INR/kg', 'Evidence status'], ingredientIds.map(id => { const ingredient = input.ingredients[id]; return [ingredient.name, ...ingredient.rates.map(money), ingredient.basis.replace(/S(\d+)/g, id => input.sources[id] ? `[${id}](${input.sources[id]})` : id)]; })));
replaceBlock('operations', table(['Operating input', 'Low', 'Base', 'High'], [
  ['Ingredient process loss', ...input.scenarios.map(s => `${s.ingredientLoss * 100}%`)],
  ['Empty packaging reject fraction', ...input.scenarios.map(s => `${s.packagingRejectFraction * 100}%`)],
  ['Complete packaging set INR', ...input.scenarios.map((_, i) => money(sum(input.packaging.map(p => p.rates[i]))))],
  ['Conversion INR per kg actual fill', ...input.scenarios.map(s => money(s.conversionPerKg))],
  ['Routine QA INR per one-route batch', ...input.scenarios.map(s => money(s.routineQaPerBatch))],
  ['Inbound and storage INR per serving', ...input.scenarios.map(s => money(s.inboundStoragePerServing))],
  ['Contingency on recurring subtotal', ...input.scenarios.map(s => `${s.contingencyFraction * 100}%`)]
]));
const costRows = [
  ['Protein ingredients', r => sum(r.scenarios[1].ingredientLines.filter(line => input.ingredients[line.id].proteinFraction > 0).map(line => line.cost))],
  ['Resistant dextrin', r => r.scenarios[1].ingredientLines.find(line => line.id === 'fibre').cost],
  ['Sunflower fat powder', r => r.scenarios[1].ingredientLines.find(line => line.id === 'fat').cost],
  ['Decaf coffee', r => r.scenarios[1].ingredientLines.find(line => line.id === 'coffee').cost],
  ['Latte flavour and masking compound', r => r.scenarios[1].ingredientLines.find(line => line.id === 'flavour').cost],
  ['Lecithin plus sweetener preblend plus salt', r => sum(r.scenarios[1].ingredientLines.filter(line => ['lecithin','sweetener','salt'].includes(line.id)).map(line => line.cost))],
  ['Ingredients subtotal', r => r.scenarios[1].nominalIngredients],
  ['Fill overage', r => r.scenarios[1].fillOverage],
  ['Process ingredient loss', r => r.scenarios[1].processLoss],
  ['Manufacturing and filling', r => r.scenarios[1].conversion],
  ['Routine batch release testing', r => r.scenarios[1].routineQa],
  ['Premium tin packaging including rejects', r => r.scenarios[1].packaging],
  ['Inbound freight and storage allowance', r => r.scenarios[1].inboundStorage],
  ['Contingency', r => r.scenarios[1].contingency],
  ['Recurring packed cost', r => r.scenarios[1].recurringPerServing]
];
replaceBlock('cost', table(['INR per serving', ...results.map(r => r.id)], costRows.map(([label, fn]) => [label, ...results.map(r => money(fn(r)))])));
replaceBlock('packaging', table(['Component', 'INR per set in base case'], input.packaging.map(p => [p.name, money(p.rates[1])]).concat([['Complete set before rejects', money(sum(input.packaging.map(p => p.rates[1])))], ['Effective per saleable tin including rejects', money(results[0].scenarios[1].packaging * servingsPerTin)], ['Per 34 g serving', money(results[0].scenarios[1].packaging)]])));
replaceBlock('summary', table(['Prototype', 'Recurring INR per serving', 'Recurring INR per 510 g tin', 'Low to high INR per serving', 'First launch INR per serving'], results.map(r => [r.id + (r.conditionalYeastPrice ? ' conditional' : ''), money(r.scenarios[1].recurringPerServing), money(r.scenarios[1].recurringPerTin), `${money(r.scenarios[0].recurringPerServing)} to ${money(r.scenarios[2].recurringPerServing)}`, money(r.firstLaunchPerServing)])));
replaceBlock('pack-size', table(['Prototype', '500 g tin INR per serving equivalent', '500 g tin total INR', '510 g tin INR per serving'], results.map(r => [r.id, money(r.fiveHundredGramTin.recurringPerServing), money(r.fiveHundredGramTin.recurringPerTin), money(r.scenarios[1].recurringPerServing)])));
await writeFile(specUrl, spec);
await writeFile(new URL('costing/prototype-estimates.json', folder), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(results.map(r => ({ id: r.id, protein: r.calculatedMainProteinGrams, recurring: Number(money(r.scenarios[1].recurringPerServing)), tin: Number(money(r.scenarios[1].recurringPerTin)), range: [0,2].map(i => Number(money(r.scenarios[i].recurringPerServing))), firstLaunch: Number(money(r.firstLaunchPerServing)), conditionalYeastPrice: r.conditionalYeastPrice })), null, 2));
