import SV from './sv.js';
import * as FS from 'fs';

function merge(...tables){
    let output = {};
    let keys = {
        union: [...new Set(tables.map(table=>Object.keys(table)).flat())],
        intersect: Object.keys(tables[0]).filter(key=>tables.every(table=>table[key]))
    }
    // console.log('union',keys.union);
    // console.log('intersect',keys.intersect);
    for(let key of keys.intersect)
        output[key] = Object.assign(...tables.map(table=>table[key]));
    return output;
}

let tsv = new SV();
let pollution = tsv.load('pollution.tsv');
let population = tsv.load('population.tsv');
let forest = tsv.load('forest.tsv');
let area = tsv.load('area.tsv');
let gdp = tsv.load('gdp.tsv');
let data = merge(pollution, population,forest, area, gdp);
console.log(data);
FS.writeFileSync('data.json', JSON.stringify(data,0,4));


for (let country in data) {
    let x = data[country];
    // for (let item in x) x[item] = x[item].replace(/,/g, '');
    x.pollution_M = Math.round(x.pollution * 1);
    x.forest_K = Math.round(x.forest / 1000);
    x.gdp_G = Math.round(x.gdp / 1000);
    // if(item.forestKilo == 0) item.forestKilo = 0.01;
    x.pop_M = Math.round(x.population / 1000 / 1000);
    x.area_K = Math.round(x.area / 1000);
    x.pollutionPerForest = Math.round(x.pollution_M * 1000 / x.forest_K)
    x.pollutionPerDollar = Math.round(x.pollution_M * 1000 / x.gdp_G);
    x.pollutionPerPerson = (x.pollution_M / x.pop_M).toFixed(2)*1;
    x.populationDensity = Math.round(x.population / x.area);
    x.forestDensity = Math.round(x.forest * 100 / x.area);
    x.gdpPerPerson = Math.round(x.gdp / x.pop_M);
    x.gdpDensity = Math.round(x.gdp * 1000 / x.area);
    x.duePayment = Math.round(x.forest_K - x.pollution_M);
}

FS.writeFileSync('data.more.json', JSON.stringify(data,0,4));




const prettyNumber = { Infinity: '&infin;', NaN: '-' }
const n3 = (x, i) => (i % 3 == 2 ? '\u202F' + x : x)
const formatNumber = n => prettyNumber[n] ? prettyNumber[n] : (n + '').split('.').map((x, i) => i == 0 ? x.split('').reverse().map(n3).reverse().join('') : x.split('').map(n3).join('')).join('.');

const hsl = h => `background: hsl(${h},100%,50%);`;
// <td type='float'>${data.po_fo}</td>
// <td type='int'>${data.gdp_dens}</td> 
const row = data => `<tr> 
            <td type='rank'></td>
            <td type='string'>${data.country}</td>  

            <td type='int'>${formatNumber(data.pollution_M)}</td> 
            <td type='int'>${formatNumber(data.forest_K)}</td> 
            <td type='int'>${formatNumber(data.pop_M)}</td> 
            <td type='int'>${formatNumber(data.gdp_G)}</td> 
            <td type='int'>${formatNumber(data.area_K)}</td> 

            <td type='int' sort='${data.pollutionPerForest}' style='${hsl(120 - (data.pollutionPerForest > 1400 ? 140 : (data.pollutionPerForest / 12)))}'>${formatNumber(data.pollutionPerForest)}</td> 
            <td type='int' sort='${data.pollutionPerDollar}' style='${hsl(120 - (data.pollutionPerDollar > 1400 ? 140 : (data.pollutionPerDollar / 12)))}'>${formatNumber(data.pollutionPerDollar)}</td> 
            <td type='int' sort='${data.pollutionPerPerson}' style='${hsl(120 - (data.pollutionPerPerson > 14 ? 140 : (data.po_pe * 9)))}'>${formatNumber(data.pollutionPerPerson)}</td> 

            <td type='int' style='${hsl(120 - (data.populationDensity > 150 ? 150 : (data.populationDensity * 1)))}'>${data.populationDensity}</td> 
            <td type='int' style='${hsl((data.gdpPerPerson > 20000 ? 100 : (data.gdpPerPerson / 200)))}' sort='${data.gdpPerPerson}'>${formatNumber(data.gdpPerPerson)}&#8239;$</td> 
            <td type='int' style='${hsl(data.forestDensity * 1.2)}'>${data.forestDensity}&#8239;%</td> 
            <td type='int' style='background:${data.duePayment<0?'red':'green'}'>${formatNumber(data.duePayment)}</td> 
        </tr>`;

let html = '<table>' + Object.values(data).map(row).join('\n')+'</table>';
FS.writeFileSync('index.html', html);

