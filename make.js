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
