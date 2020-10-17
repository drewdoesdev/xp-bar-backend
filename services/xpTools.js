var tables = require("../xpTables.json");

const getCurrentLevel = (table, currentXp) => {
    const xp = currentXp;
    let level = table.filter(row => {
        return xp >= row.xpFloor && xp < row.nextLevel;
    })

    console.log(level);

    return level[0];
}

module.exports = {
    getCurrentLevel: getCurrentLevel
};