var tables = require("../xpTables.json");

const getCurrentLevel = (table, currentXp) => {
    const xp = Math.abs(currentXp);
    const tableEnd = table.length - 1;
    console.log(table[tableEnd]);
    let level;

    if(xp > table[tableEnd].xpFloor){
        console.log("END TABLE")
        level = [table[tableEnd]];
    }
    else {
        level = table.filter(row => {
            return xp >= row.xpFloor && xp < row.nextLevel;
        })
    }

    return level[0];
}

module.exports = {
    getCurrentLevel: getCurrentLevel
};