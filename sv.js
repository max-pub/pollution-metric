import * as FS from 'fs';

export default class SV {
    constructor(columnDelimiter = '\t', lineDelimiter = '\n', headRow = 1, headColumn = 1) {
        this.lineDelimiter = lineDelimiter;
        this.columnDelimiter = columnDelimiter;
        this.headRow = headRow;
        this.headColumn = headColumn;
    }
    arrayToObject(array) {
        // console.log(array);
        let output = this.headColumn ? {} : [];
        if (this.headRow) var headRow = array.shift();
        // else rowHeader = new Array(array.length).fill(1).map((x,i)=>i)
        for (let row in array) {
            let newRow = headRow ? {} : [];
            // if (this.headColumn) var headColumn = array[row].shift();
            // else colHeader = row;
            if (headRow)
                for (let col in array[row]){
                // console.log('col',row,col, array[row], array[row][col], array[row][col]*1);
                    let cell = array[row][col].trim();
                    if(cell*1==cell) cell = cell*1;
                    newRow[headRow[col]] = cell;

                }
            else newRow = array[row];
            if (this.headColumn) output[array[row][0]] = newRow;
            else output.push(newRow);
        }
        return output;
    }
    parse(string) {
        return string.split(this.lineDelimiter).map(line => line.trim().split(this.columnDelimiter));
    }
    stringify(array) {
        return array.map(line => line.join(this.columnDelimiter)).join(this.lineDelimiter);
    }
    async fetch(url) {
        return this.parse(await fetch(url).then(x => x.text()));
    }
    load(path) {
        return this.arrayToObject(this.parse(FS.readFileSync(path,'utf8')));
    }
}
