import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import {Workbook,SpreadsheetFile} from '@oai/artifact-tool';
const out=fileURLToPath(new URL('../../costing', import.meta.url));
const wb=Workbook.create();const s=wb.worksheets.add('Feasibility');const q=wb.worksheets.add('Suppliers');
const v=(sh,a,x)=>sh.getRange(a).values=[[x]];
const f=(sh,a,x)=>sh.getRange(a).formulas=[[x]];
const money='"₹"#,##0.00;("₹"#,##0.00);"–"';
const band=(sh,a)=>sh.getRange(a).format={fill:'#352D28',font:{name:'Arial',size:10,bold:true,color:'#FFFFFF'},rowHeight:26};
const inp=(sh,a)=>{sh.getRange(a).format.fill='#FFF1CC';sh.getRange(a).format.font.color='#0000FF';};
for(const sh of [s,q]){sh.showGridLines=false;sh.getRange('A1:H85').format.font={name:'Arial',size:10,color:'#352D28'};sh.getRange('A1:H85').format.rowHeight=23;sh.getRange('A1:A85').format.columnWidth=3;sh.getRange('B1:B85').format.columnWidth=48;sh.getRange('C1:F85').format.columnWidth=19;sh.getRange('G1:G85').format.columnWidth=3;sh.getRange('H1:H85').format.columnWidth=115;sh.getRange('C1:F85').format.horizontalAlignment='right';sh.getRange('B2').format.font={name:'Arial',size:15,bold:true,color:'#352D28'};}
v(s,'B2','Nurture 250 kg trial feasibility');v(s,'B3','19 October 2026. Published listings and explicit allowances; no firm supplier quotes or prototype results.');
v(s,'B5','Selected route');v(s,'C5',1);inp(s,'C5');s.getRange('C5').dataValidation={rule:{type:'list',values:['1','2','3','4']}};
f(s,'D5','=CHOOSE(C5,"MPC only","MPC + whey","MPC + listed yeast","MPC + soluble yeast")');s.getRange('D5:F5').merge();s.getRange('D5').format.font.color='#315C4A';
v(s,'B7','Packed product cost, INR / serving');f(s,'C7','=F43');
v(s,'B8','Budget remaining against INR45');f(s,'C8','=C16-C7');
v(s,'B9','Cost basis');f(s,'C9','=IF(COUNTBLANK(E27:E30)>0,"Missing grade price","Indicative only")');s.getRange('C9:F9').merge();
v(s,'B10','Hot water / hot milk performance');v(s,'C10','UNTESTED');
v(s,'B11','Taste and fortified shelf life');v(s,'C11','UNTESTED');
s.getRange('B7:F8').format.fill='#F2EEE7';s.getRange('B7:F8').format.font.bold=true;s.getRange('C7:C8').setNumberFormat(money);
band(s,'B14:F14');v(s,'B14','Inputs and source status');
const inputs=[
 [15,'Protein target, g',15,'Theoretical protein from ingredients, on an as-sold basis. Confirm with final COAs and label testing.'],
 [16,'Recurring packed-cost ceiling, INR',45,'Excludes development spend, outbound fulfilment, marketing and fixed business overhead.'],
 [17,'Protein ingredient trial order, kg',250,'Assumed total concentrated-protein quantity, not finished-powder batch weight.'],
 [18,'MPC80 protein fraction',.8,'Nominal. Exact grade and batch COA are unconfirmed.'],
 [19,'WPC80 protein fraction',.8,'Nominal. Founder manufacturing rate is confirmed; protein fraction still needs confirmation.'],
 [20,'Yeast protein fraction',.8,'Placeholder only. F80 datasheet has different typical/minimum and dry/as-sold values.'],
 [21,'MPC80 rate, INR/kg',1050,'Public marketplace listing; rate, order units, actual grade, freight and tax treatment unconfirmed.'],
 [22,'WPC80 rate, INR/kg',3642,'Founder: INR1821/500g manufacturing cost, excluding 5% GST and all packaging.'],
 [23,'Listed AngeoPro rate, INR/kg',899,'Supplier lists 25kg pack, INR899/kg++; grade not identified as S80-A. Not a suitability confirmation.'],
 [24,'Soluble S80-A rate, INR/kg',null,'No public Indian bulk price verified. Enter only after a grade-specific delivered quote.'],
];
for(const[r,label,val,note]of inputs){v(s,`B${r}`,label);v(s,`C${r}`,val);inp(s,`C${r}`);v(s,`H${r}`,note);}
s.getRange('C18:C20').setNumberFormat('0.0%');
s.getRange('B26:F26').values=[['Ingredient','g / serving','Protein fraction','INR / kg','INR / serving']];band(s,'B26:F26');
const items=[['MPC80',null,null,null,null],['WPC80',null,null,null,null],['Yeast protein',null,null,null,null],['Skim milk powder',3,.35,450,null],['Creaminess ingredient',2,0,800,null],['Instant coffee',1.5,0,2000,null],['Flavour / masking',.35,0,4000,null],['B12 + D premix reserve',.25,0,6000,null],['Emulsifier / stabiliser',.15,0,1500,null],['Sweetener system',.08,0,5000,null],['Salt',.03,0,30,null]];
s.getRange('B27:F37').values=items;
f(s,'D27','=C18');f(s,'D28','=C19');f(s,'D29','=C20');
f(s,'C28','=CHOOSE($C$5,0,1,0,0)/D28');f(s,'C29','=CHOOSE($C$5,0,0,4,4)/D29');
f(s,'C27','=($C$15-SUMPRODUCT(C28:C37,D28:D37))/D27');
f(s,'E27','=C21');f(s,'E28','=C22');f(s,'E29','=IF($C$5=4,IF($C$24="","",$C$24),$C$23)');
f(s,'F27','=IF(E27="","",C27*E27/1000)');s.getRange('F27:F37').fillDown();inp(s,'C30:E37');
v(s,'B38','Ingredients total');f(s,'C38','=SUM(C27:C37)');f(s,'D38','=SUMPRODUCT(C27:C37,D27:D37)');f(s,'F38','=IF(COUNTBLANK(E27:E37)>0,"",SUM(F27:F37))');
v(s,'B39','Ingredient yield loss');v(s,'C39',.02);inp(s,'C39');s.getRange('C39').setNumberFormat('0.0%');f(s,'F39','=IF(F38="","",F38/(1-C39)-F38)');
v(s,'B40','Beverage processing per serving');v(s,'F40',3);inp(s,'F40');
v(s,'B41','Batch release tests / servings');v(s,'C41',40000);inp(s,'C41');f(s,'D41','=$C$17*1000/SUM(C27:C29)*(1-$C$39)');f(s,'F41','=C41/D41');
v(s,'H41','INR40,000 test allowance divided by theoretical saleable servings from the 250kg protein order.');
v(s,'B42','Pouch + inbound + contingency');v(s,'C42',2.5);v(s,'D42',1);v(s,'E42',3);inp(s,'C42:E42');f(s,'F42','=SUM(C42:E42)');
v(s,'H42','Three separate allowances: primary pouch/scoop INR2.50; inbound/storage INR1; unresolved manufacturing costs INR3.');
v(s,'B43','Recurring packed cost');f(s,'F43','=IF(F38="","",SUM(F38:F42))');
v(s,'B44','Powder mass per 30 servings, g');f(s,'F44','=C38*30');
v(s,'H44','Approximate development mass, not a pack specification. Sweetener/premix dosing rates are placeholders.');
v(s,'B46','Commercial assumptions');band(s,'B46:F46');
const comm=[
 [47,'Output GST assumption',.05],[48,'Servings per order',30],[49,'Outbound delivery + handling / order',145],[50,'Payment fee / customer payment',.02],[51,'Returns reserve / net sales',.02],[52,'Target contribution / net sales',.2],[53,'First acquisition spend / order',600],[54,'Repeat retention spend / order',90],[55,'Development recovery per serving',5],[56,'One consumer price / serving',79]
];for(const[r,label,val]of comm){v(s,`B${r}`,label);v(s,`C${r}`,val);inp(s,`C${r}`);}
for(const r of [47,50,51,52])s.getRange(`C${r}`).setNumberFormat('0.0%');
v(s,'B58','Economics at the same customer price');s.getRange('C58:D58').values=[['First order','Repeat order']];band(s,'B58:D58');
for(const col of ['C','D']){
 f(s,`${col}59`,'=$C$56');f(s,`${col}60`,`=${col}59/(1+$C$47)`);
 f(s,`${col}61`,col==='C'?'=$C$53/$C$48':'=$C$54/$C$48');
 f(s,`${col}62`,`=IF($F$43="","",${col}60*(1-$C$51)-${col}59*$C$50-$F$43-$C$55-$C$49/$C$48-${col}61)`);
 f(s,`${col}63`,`=IF(${col}62="","",${col}62/${col}60)`);
 f(s,`${col}64`,`=IF($F$43="","",($F$43+$C$55+$C$49/$C$48+${col}61)/((1-$C$51-$C$52)/(1+$C$47)-$C$50))`);
}
for(const[r,label]of Object.entries({59:'Customer selling price',60:'Sales excluding GST',61:'Acquisition / retention allocation',62:'Contribution after development allocation',63:'Contribution / net sales',64:'Price needed for target contribution'}))v(s,`B${r}`,label);
v(s,'B66','Upfront development budget, INR');v(s,'C66',300000);inp(s,'C66');
v(s,'B67','Development cash / first-trial serving');f(s,'C67','=C66/D41');
v(s,'H67','Separate from the INR5 long-run recovery assumption. Full first-trial cash burden is higher than recurring cost.');
v(s,'B69','Route key');band(s,'B69:F69');
for(const[r,label]of [[70,'1: MPC only; milk powder supplies part of the 15g protein.'],[71,'2: MPC + 1g protein from whey.'],[72,'3: MPC + 4g protein from listed yeast; sensory suitability remains unverified.'],[73,'4: MPC + 4g protein from soluble S80-A; cost stays unavailable until its price is entered.'],[75,'All formulations are cost architectures. No taste, hot-mixing or shelf-life claims are validated.'],[76,'Input prices exclude recoverable tax. Verify landed rates, exact protein basis and premix scope.'],[77,'Proposed consumer preparation: 200mL, normal spoon, measured preparation temperatures; no boiling claim.']])v(s,`B${r}`,label);
s.getRange('C27:C38').setNumberFormat('0.000');s.getRange('D27:D37').setNumberFormat('0.0%');s.getRange('D38').setNumberFormat('0.00');s.getRange('E27:F44').setNumberFormat('#,##0.00');s.getRange('C59:D64').setNumberFormat(money);s.getRange('C63:D63').setNumberFormat('0.0%');
for(const r of [38,43]){s.getRange(`B${r}:F${r}`).format.fill='#F2EEE7';s.getRange(`B${r}:F${r}`).format.font.bold=true;}
s.getRange('C8').conditionalFormats.add('cellIs',{operator:'lessThan',formula:0,format:{fill:'#FBE4E4',font:{color:'#9C2020',bold:true}}});

v(q,'B2','Supplier evidence and request brief');v(q,'B3','No supplier has confirmed a dated delivered quote for the 250kg trial.');
const suppliers=[
 ['MPC80: Thirthraj Consolidated',1050,'25kg stated; MOQ units inconsistent','Unconfirmed listing','https://www.tradeindia.com/products/80-milk-protein-concentrate-powder-6648239.html'],
 ['MPC: EnNutrica / Dindigul',880,'2 tonnes advertised','Outside trial quantity','https://www.exportersindia.com/product-detail/paper-box-milk-protein-concentrates-4837886.htm'],
 ['MPC80: EnNutrica Formula 8+',null,'20kg bags in manufacturer PDS','Grade candidate; no firm price','https://www.ennutrica.com/wp-content/uploads/2019/02/PDS-Formula-8-by-EnNutrica-1.pdf'],
 ['Yeast: EasyBuy AngeoPro',899,'25kg bags; price marked ++','Exact grade unconfirmed','https://easybuyingredients.com/product/angeopro-yeast-protein-angel-yeast/'],
 ['Yeast: Angel S80-A',null,'India stock / MOQ not verified','Beverage candidate; price unknown','https://en.angelyeast.com/news/yeast-protein/angel-yeast-at-vitafoods-europe-2026.html']
];
q.getRange('B5:F5').values=[['Supplier / grade','INR / kg','Pack / order condition','Evidence status','Source']];band(q,'B5:F5');
suppliers.forEach((r,i)=>{q.getRange(`B${6+i}:F${6+i}`).values=[[...r.slice(0,4),null]];v(q,`H${6+i}`,r[4]);});
q.getRange('D6:E10').format.wrapText=true;q.getRange('D6:E10').format.horizontalAlignment='left';q.getRange('B6:H10').format.rowHeight=60;q.getRange('B6:H10').format.verticalAlignment='center';
v(q,'B13','Quote request ready for supplier confirmation');band(q,'B13:F13');
const rfq=[
 'Nurture: instant fortified coffee powder delivering 15g protein per serving; for hot water and hot milk.',
 'Trial requirement: 250kg total concentrated-protein ingredients. Quote actual bag multiples and split-order options.',
 'MPC suppliers: quote MPC70/MPC80 beverage grades, including instant/modified grades where appropriate.',
 'Yeast suppliers: quote exact F80/F84 and S80-A grades separately. Do not substitute one price or specification for another.',
 'Provide ex-GST unit rate, GST/HSN, delivered freight, MOQ, bag size, stock, origin, batch age, lead time and quote validity.',
 'Delivery PIN remains to be supplied. No delivered-price conclusion is possible until freight is confirmed.',
 'Provide current signed TDS and batch COA; protein on as-sold and dry bases, moisture and nitrogen conversion factor.',
 'Include lactose/carbohydrates, fat, sodium/calcium, allergens, microbiological/contaminant specifications and Indian use documentation.',
 'Describe preparation method, temperature/pH limits, recommended protein concentration and required shear/hydration time.',
 'Supply representative evaluation samples before a 250kg purchase. Quote beverage application support separately.',
 'Provide an unfortified coffee prototype and quote premix integration, instantisation and pilot processing where available.',
];rfq.forEach((x,i)=>v(q,`B${14+i}`,x));
v(q,'B27','Bench gates to establish suitability');band(q,'B27:F27');
const gates=[
 'Compare MPC-only, MPC + small whey contribution, and MPC + 4g yeast-protein contribution at matched protein/sweetness.',
 'Use one complete fortified formula in both 200mL water and milk; assess 60/75/85C preparation conditions.',
 'Test normal spoon preparation; record required stirring and any slurry step. Cool samples appropriately for sensory assessment.',
 'Check immediate, 5-minute and 15-minute lumps, sediment, foam, thickening, separation and flavour/aftertaste.',
 'Blind repeated-use testing with target customers must establish acceptable taste and real coffee-occasion replacement.',
 'Repeat with stored powder and the final nutrient premix. Confirm nutrients analytically and use actual manufacturing yields.',
 'Record all failures and any extra processing/flavour/stabilisation cost before confirming the INR45 ceiling.'
];gates.forEach((x,i)=>v(q,`B${28+i}`,x));
v(q,'B37','Manufacturer F80 data: protein specification differs from a blanket 80% as-sold assumption.');v(q,'H37','https://ss3-production-public.s3.amazonaws.com/seller-document/171/A23BF7792FA6C9EAA9B20AF225FAFA45.pdf');
v(q,'B38','MPC rehydration research: high protein does not by itself establish quick spoon mixing.');v(q,'H38','https://pubmed.ncbi.nlm.nih.gov/32098298/');
v(q,'B39','Price evidence is separate from proof of grade suitability or finished-product performance.');
q.getRange('C6:C10').setNumberFormat(money);
wb.recalculate();
const captures=[];
for(const route of [1,2,3,4]){v(s,'C5',route);wb.recalculate();const vals={route,cost:s.getRange('F43').values[0][0],protein:s.getRange('D38').values[0][0],saleableServings:s.getRange('D41').values[0][0]};if(Math.abs(vals.protein-15)>1e-8)throw Error('Protein reconciliation failed');if(route===4&&vals.cost!=='')throw Error('Missing soluble-grade price must remain unavailable');captures.push(vals);}
v(s,'C5',4);v(s,'C24',1500);wb.recalculate();if(!(Number(s.getRange('F43').values[0][0])>0))throw Error('Soluble-grade price entry did not calculate');v(s,'C24',null);
v(s,'C5',1);v(s,'C21',1350);wb.recalculate();if(Number(s.getRange('F43').values[0][0])<=45)throw Error('MPC-price sensitivity failed');v(s,'C21',1050);wb.recalculate();
const independent=(17.4375*1.05+9.4759)/.98+3+40000/(250000/17.4375*.98)+2.5+1+3;
if(Math.abs(independent-Number(s.getRange('F43').values[0][0]))>1e-8)throw Error('Independent packed-cost reconciliation failed');
const err=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:30},summary:'Final error scan'});
await fs.writeFile(`${out}/feasibility-checks.json`,JSON.stringify({captures,independent,errorScan:err},null,2));console.log(err.ndjson);
for(const[name,range]of [['Feasibility','B2:F11'],['Suppliers','B5:E10']]){const blob=await wb.render({sheetName:name,range,scale:1.5,format:'png'});await fs.writeFile(`${out}/${name.toLowerCase()}-view.png`,new Uint8Array(await blob.arrayBuffer()));}
await(await SpreadsheetFile.exportXlsx(wb)).save(`${out}/nurture-250kg-feasibility.xlsx`);
await fs.writeFile(`${out}/supplier-quote-request.txt`,['NURTURE - PROTEIN INGREDIENT QUOTE REQUEST','19 October 2026','',...rfq,'','Proposed evaluation:',...gates].join('\n'));
console.log(JSON.stringify(captures));console.log((await wb.inspect({kind:'table',range:'Feasibility!B59:D67',include:'values,formulas',tableMaxRows:9,tableMaxCols:3})).ndjson);
