import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import { Workbook, SpreadsheetFile } from '@oai/artifact-tool';

const out = fileURLToPath(new URL('../../costing', import.meta.url));
const wb = Workbook.create();
const p = wb.worksheets.add('Pricing');
const c = wb.worksheets.add('Costing');
const money = '"₹"#,##0.00;("₹"#,##0.00);"–"';
const num = '#,##0.00;(#,##0.00);"–"';
const ink = '#352D28', green = '#315C4A', light = '#F2EEE7';
function v(s, cell, value) { s.getRange(cell).values = [[value]]; }
function f(s, cell, value) { s.getRange(cell).formulas = [[value]]; }
function band(s, range) { s.getRange(range).format = { fill: ink, font: {name:'Arial',size:10,bold:true,color:'#FFFFFF'},rowHeight:27 }; }
function input(s, range) { s.getRange(range).format.fill='#FFF1CC'; s.getRange(range).format.font.color='#0000FF'; }
for (const s of [p,c]) {
  s.showGridLines=false;
  s.getRange('A1:H62').format.font={name:'Arial',size:10,color:ink};
  s.getRange('A1:H62').format.rowHeight=23;
  s.getRange('A1:H62').format.verticalAlignment='center';
  s.getRange('A1:A62').format.columnWidth=3;
  s.getRange('B1:B62').format.columnWidth=45;
  s.getRange('C1:F62').format.columnWidth=18;
  s.getRange('G1:G62').format.columnWidth=3;
  s.getRange('H1:H62').format.columnWidth=105;
  s.getRange('H1:H62').format.font.color='#70675F';
  s.getRange('H1:H62').format.wrapText=false;
  s.getRange('B2').format.font={name:'Arial',size:15,bold:true,color:ink};
  s.getRange('B2:F2').format.borders={bottom:{style:'thin',color:'#A68F78'}};
  s.tabColor=green;
}
v(c,'B2','Nurture serving cost');
v(c,'B3','19 October 2026. INR. Editable inputs are amber.');
v(c,'B5','Protein target, g per serving'); v(c,'C5',15); input(c,'C5');
v(c,'B6','WPC cost supplied by founder, INR'); v(c,'C6',1821); input(c,'C6');
v(c,'B7','WPC quantity covered by that cost, g'); v(c,'C7',500); input(c,'C7');
v(c,'B8','WPC cost, INR/kg'); f(c,'C8','=C6/C7*1000');
v(c,'B9','Input WPC GST'); v(c,'C9',0.05); input(c,'C9');
v(c,'B10','Recoverable fraction of WPC input GST'); v(c,'C10',1); input(c,'C10');
v(c,'H6','Founder: manufacturing cost only; excludes 5% GST, packaging and other charges.');
v(c,'H10','1 = full eligible input-tax credit. Set to 0 if unrecoverable. Other rates are net of recoverable tax.');
c.getRange('B12:F12').values=[['Costing ingredients','g / serving','Protein fraction','INR / kg','INR / serving']]; band(c,'B12:F12');
const ingredients=[
  ['WPC80',null,0.8,null,null],
  ['Skim milk powder',3,0.35,450,null],
  ['Low-carbohydrate creaminess ingredient',2,0,800,null],
  ['Instant coffee',1.5,0,2000,null],
  ['Flavour and masking system',0.35,0,4000,null],
  ['Micronutrient premix allowance',0.25,0,6000,null],
  ['Emulsifier / stabiliser allowance',0.15,0,1500,null],
  ['Sweetener system allowance',0.08,0,5000,null],
  ['Salt',0.03,0,30,null],
];
c.getRange('B13:F21').values=ingredients;
f(c,'C13','=($C$5-SUMPRODUCT(C14:C21,D14:D21))/D13');
f(c,'E13','=$C$8*(1+$C$9*(1-$C$10))');
f(c,'F13','=C13*E13/1000'); c.getRange('F13:F21').fillDown();
input(c,'D13'); input(c,'C14:E21');
v(c,'H13','80% protein is assumed, not yet confirmed. Quantity adjusts for protein supplied by milk powder.');
v(c,'H14','Budget INR450/kg; supplier listing INR340/kg is only an indication and has inconsistent product naming.');
v(c,'H15','Allowance only: select a functional low-carbohydrate ingredient; verify all carriers and protein contributions.');
v(c,'H16','Budget INR2,000/kg, not a quote. Caffeine requires supplier specification and finished-product measurement.');
v(c,'H17','Budget allowance; actual flavour strength and masking needs require bench work.');
v(c,'H18','B12 + D costing reserve, not an approved premix, nutrient dose or dosing rate. Calcium/iron additions uncosted.');
v(c,'H19','Budget allowance. Ingredient permissions, instantisation and thermal behaviour require validation.');
v(c,'H20','Costing placeholder only; final sweetener form and dosage must be selected by the formulator.');
v(c,'B23','Total ingredients'); f(c,'C23','=SUM(C13:C21)'); f(c,'D23','=SUMPRODUCT(C13:C21,D13:D21)'); f(c,'F23','=SUM(F13:F21)');
v(c,'B24','Material yield loss'); v(c,'C24',0.02); input(c,'C24'); f(c,'F24','=F23/(1-C24)-F23');
v(c,'B25','Ingredients after yield loss'); f(c,'F25','=SUM(F23:F24)');
v(c,'B27','Additional beverage blending / instantisation'); v(c,'F27',3); input(c,'F27');
v(c,'H27','INR60,000 on 20,000 servings. Incremental beverage processing only; WPC manufacture is already included.');
v(c,'B28','Routine batch testing and release'); v(c,'C28',40000); v(c,'D28',20000); input(c,'C28:D28'); f(c,'F28','=C28/D28');
v(c,'H28','INR40,000 test budget / 20,000 released servings. A quote is required for the agreed testing panel.');
v(c,'B29','Primary pouch, label and scoop allocation'); v(c,'C29',75); v(c,'D29',30); input(c,'C29:D29'); f(c,'F29','=C29/D29');
v(c,'H29','INR75 per 30-serving refill pouch. Excludes decorative tin and individual sachets.');
v(c,'B30','Inbound freight and storage allocation'); v(c,'F30',1); input(c,'F30');
v(c,'B31','Recurring packed product cost'); f(c,'F31','=F25+SUM(F27:F30)');
v(c,'B33','Development / validation recovery'); v(c,'C33',300000); v(c,'D33',60000); input(c,'C33:D33'); f(c,'F33','=C33/D33');
v(c,'H33','Planning budget INR300,000 spread over 60,000 servings. Cash spend precedes sales; quote scope separately.');
v(c,'B34','Cost including development recovery'); f(c,'F34','=SUM(F31,F33)');
v(c,'B36','WPC input GST cash paid per serving'); f(c,'F36','=C13*$C$8/1000*$C$9');
v(c,'H36','Shown separately for working capital. Recoverable GST is excluded from economic cost.');
v(c,'B37','Powder mass per 30-serving pouch, g'); f(c,'F37','=C23*D29');
v(c,'B38','Servings in a 400 g pack'); f(c,'F38','=400/C23');
v(c,'B40','Basis and source notes'); band(c,'B40:F40');
const notes=[
  'This is an indicative WPC-led cost architecture, not a validated formula or evidence of great taste/hot stability.',
  'A milk-protein/whey blend remains a formulation option. No unquoted MPC savings are assumed here.',
  'All inputs except the founder WPC cost are unconfirmed planning allowances or identified public listings.',
  'Milk added by the customer is excluded. Milk powder contributes lactose; carriers need full carbohydrate review.',
  'Micronutrient forms, amounts, overages, homogeneity and shelf-life retention require a custom premix quote.',
  'Iron, extra calcium, magnesium and a broad vitamin/mineral package are not included in the premix reserve.',
  'Protein target is theoretical. Confirm as-sold ingredient specifications and finished-product label compliance.',
];
notes.forEach((x,i)=>v(c,`B${41+i}`,x));
c.getRange('B41:H47').format.rowHeight=23;
v(c,'B49','Supplier references checked 19 October 2026'); band(c,'B49:F49');
v(c,'B50','WPC80 public listing: INR2,750/kg, MOQ25kg'); v(c,'H50','https://www.tiwaribrothers.in/whey-protein.html');
v(c,'B51','Milk powder listing: INR340/kg, MOQ25kg'); v(c,'H51','https://www.tiwaribrothers.in/milk-powder.html');
v(c,'B52','Flavour public listing; grade-specific quote needed'); v(c,'H52','https://www.tiwaribrothers.in/sitemap.html');
v(c,'B53','Custom beverage premixes; no public price adopted'); v(c,'H53','https://pristinenutrientpremixes.com/beverages/');
v(c,'B54','Lower WPC listing is a procurement lead, not a confirmed landed/functional substitute.');
c.getRange('C9:C10').setNumberFormat('0.0%'); c.getRange('D13:D21').setNumberFormat('0.0%'); c.getRange('C24').setNumberFormat('0.0%');
c.getRange('C13:C23').setNumberFormat('0.000'); c.getRange('D23').setNumberFormat('0.00');
c.getRange('E13:F38').setNumberFormat(num);
for(const r of [23,25,31,34]){c.getRange(`B${r}:F${r}`).format.fill=light;c.getRange(`B${r}:F${r}`).format.font.bold=true;}

v(p,'B2','Nurture price per serving');
v(p,'B3','15 g protein target. INR. Prices include assumed 5% output GST.');
p.getRange('B5:D5').values=[['Metric','INR / serving','INR / 30 servings']]; band(p,'B5:D5');
const headline=[['Recurring packed product cost',"='Costing'!F31"],['Including development recovery',"='Costing'!F34"],['First-order price for 20% contribution','=C41'],['Repeat-order price for 20% contribution','=D41'],['Modelled first-order selling price','=C44'],['Modelled repeat selling price','=D44']];
headline.forEach((x,i)=>{const row=6+i;v(p,`B${row}`,x[0]);f(p,`C${row}`,x[1]);f(p,`D${row}`,`=C${row}*$C$15`);});
v(p,'H6','Indicative model, with founder WPC cost; protein concentration and other allowances remain unconfirmed.');
v(p,'H8','Contribution is after variable costs and development allocation, before salaries, rent, interest and income tax.');
v(p,'B14','Commercial assumptions'); band(p,'B14:D14');
const assumptions=[
  [15,'Servings per order',30,'30-serving refill pouch; shipping and acquisition are allocated per order.'],
  [16,'Output GST assumption',0.05,'Working rate only. Confirm the final product HSN/classification. Input WPC GST alone does not decide output GST.'],
  [17,'Payment fee on customer payment',0.02,'Net economic fee assumption; replace with actual payment-provider quote.'],
  [18,'Returns / damage reserve on net sales',0.02,'Net economic loss assumption, in addition to normal manufacturing yield loss.'],
  [19,'Target contribution / net sales',0.2,'Must fund fixed overhead and profit; this is not net profit.'],
  [20,'Outbound shipping per order, INR',120,'Planning allowance, shipping included in modelled selling price.'],
  [21,'Pick, pack and outer carton / order, INR',25,'Planning allowance; separate from the primary pouch.'],
  [22,'First-order acquisition cost / order, INR',600,'Planning allowance, not measured CAC. INR20 per serving at 30 servings/order.'],
  [23,'Repeat-order retention spend / order, INR',90,'Planning allowance; first-order CAC is not charged again.'],
];
for(const [r,label,value,note]of assumptions){v(p,`B${r}`,label);v(p,`C${r}`,value);input(p,`C${r}`);v(p,`H${r}`,note);}
p.getRange('C16:C19').setNumberFormat('0.0%');
v(p,'B25','Prices use one-time development recovery'); v(p,'C25',1); input(p,'C25');
v(p,'H25','1 = include development allocation; 0 = recurring cost only. This does not change upfront cash needed.');
v(p,'B26','Selling price floor denominator'); f(p,'C26','=(1-C18-C19)/(1+C16)-C17');
p.getRange('B29:D29').values=[['Per-serving economics','First order','Repeat order']]; band(p,'B29:D29');
for(const col of ['C','D']){
  f(p,`${col}30`,"='Costing'!F31");
  f(p,`${col}31`,"='Costing'!F33*$C$25");
  f(p,`${col}32`,'=$C$20/$C$15');
  f(p,`${col}33`,'=$C$21/$C$15');
  f(p,`${col}34`,col==='C'?'=$C$22/$C$15':'=$C$23/$C$15');
  f(p,`${col}35`,`=SUM(${col}30:${col}34)`);
  f(p,`${col}41`,`=${col}35/$C$26`);
  f(p,`${col}42`,`=${col}41*$C$15`);
}
const labels={30:'Recurring product cost',31:'Development allocation',32:'Outbound shipping',33:'Order handling / outer carton',34:'Acquisition or retention spend',35:'Fixed INR costs per serving',41:'Price needed for target contribution',42:'Price needed per order',44:'Chosen consumer price per serving',45:'Revenue excluding output GST',46:'Payment fee',47:'Returns / damage reserve',48:'Contribution per serving',49:'Contribution / net sales',50:'Customer order total'};
for(const[r,label]of Object.entries(labels))v(p,`B${r}`,label);
v(p,'C44',159);v(p,'D44',139);input(p,'C44:D44');
for(const col of ['C','D']){
 f(p,`${col}45`,`=${col}44/(1+$C$16)`);
 f(p,`${col}46`,`=${col}44*$C$17`);
 f(p,`${col}47`,`=${col}45*$C$18`);
 f(p,`${col}48`,`=${col}45-${col}35-SUM(${col}46:${col}47)`);
 f(p,`${col}49`,`=${col}48/${col}45`);
 f(p,`${col}50`,`=${col}44*$C$15`);
}
v(p,'B53','Interpretation'); band(p,'B53:D53');
v(p,'B54','At the current WPC cost, this is premium daily nutrition. A mass-affordable cup needs a lower protein-system cost.');
v(p,'B55','No marketplace commission, distributor/retailer margin or additional discount is included.');
v(p,'B56','No validated taste, hot-water performance, shelf life or final micronutrient specification is implied.');
v(p,'B57','If input GST is recoverable, exclude it from economic cost but fund it in working capital.');
v(p,'B59','GST reference, Schedule I, entry 145');v(p,'H59','https://courier.cbic.gov.in/ECCS/advisory/2025/NOTIFICATION%20NO.%209_2025-INTEGRATED%20TAX%20%28RATE%29%20-1759486719.pdf');
v(p,'B60','Rate is provisional for Nurture. Confirm classification and amendments before setting the final consumer price.');
p.getRange('C6:D11').setNumberFormat(money);p.getRange('C30:D50').setNumberFormat(money);p.getRange('C49:D49').setNumberFormat('0.0%');
for(const r of [6,7,8,9,10,11,35,41,42,48,49,50]){p.getRange(`B${r}:D${r}`).format.fill=light;p.getRange(`B${r}:D${r}`).format.font.bold=true;}
// Numerics and model inputs are kept distinct from result cells.
for(const s of [p,c])s.getRange('C1:F62').format.horizontalAlignment='right';
p.getRange('C29:D29').format.horizontalAlignment='center';c.getRange('C12:F12').format.horizontalAlignment='center';
c.freezePanes.freezeRows(12);

// Verify live recalculation, then restore the original assumptions.
wb.recalculate();
const original=Number(p.getRange('C41').values[0][0]);
v(c,'C6',1921);wb.recalculate();
const changed=Number(p.getRange('C41').values[0][0]);
if(!(changed>original))throw new Error('Price did not increase when WPC input cost increased');
v(c,'C6',1821);v(c,'C10',0);wb.recalculate();
const noCredit=Number(c.getRange('F31').values[0][0]);
v(c,'C10',1);wb.recalculate();
if(!(noCredit>Number(c.getRange('F31').values[0][0])))throw new Error('Input-tax credit test failed');
const protein=Number(c.getRange('D23').values[0][0]);
if(Math.abs(protein-15)>1e-8)throw new Error('Protein mass balance failed');
const independentIngredients=(15-3*.35)/.8*3.642+3*.45+2*.8+1.5*2+.35*4+.25*6+.15*1.5+.08*5+.03*.03;
const independentPacked=independentIngredients/.98+3+2+2.5+1;
if(Math.abs(independentPacked-Number(c.getRange('F31').values[0][0]))>1e-8)throw new Error('Independent cost reconciliation failed');
const inspect=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:30},summary:'Formula error scan'});
await fs.writeFile(`${out}/verification.json`,JSON.stringify({inspect,protein,original,changed,noCredit,independentPacked},null,2));
console.log((await wb.inspect({kind:'table',range:'Pricing!B5:D11',include:'values,formulas',tableMaxRows:7,tableMaxCols:3})).ndjson);
console.log(JSON.stringify({costRows:c.getRange('F23:F38').values,price:p.getRange('C41:D50').values}));
for(const [sheet,range]of [['Pricing','B2:F23'],['Costing','B12:F34']]){
 const preview=await wb.render({sheetName:sheet,range,scale:1.5,format:'png'});
 await fs.writeFile(`${out}/${sheet.toLowerCase()}-preview.png`,new Uint8Array(await preview.arrayBuffer()));
}
const file=await SpreadsheetFile.exportXlsx(wb);await file.save(`${out}/nurture-serving-cost.xlsx`);
console.log('Saved nurture-serving-cost.xlsx');
