var tables = require("../xpTables.json");

const getCurrentLevel = (table, currentXp) => {
    console.log(currentXp);
    const xp = currentXp;
    let level = table.filter(row => {
        console.log(xp);
        return xp >= row.xpFloor && xp < row.nextLevel;
    })

    return level[0];
}

module.exports = {
    getCurrentLevel: getCurrentLevel
};