var tables = require("../xpTables.json");

export const findCurrentXpByLevel = (systemId, level) => {
    return tables[systemId][level].currentXp
}