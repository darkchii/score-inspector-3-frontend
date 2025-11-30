import ModData from "../Data/Mods.json";

const _modDatabase = {};

export function GetModData(ruleset, acronym) {
    if(Object.keys(_modDatabase).length === 0) {
        BuildDatabase();
    }

    if(_modDatabase[ruleset] && _modDatabase[ruleset][acronym]) {
        return _modDatabase[ruleset][acronym];
    }
}

//Builds a better lookup database for mods
function BuildDatabase() {
    for(const ruleset in ModData) {
        _modDatabase[ModData[ruleset].Name] = {};
        for(const mod of ModData[ruleset].Mods) {
            _modDatabase[ModData[ruleset].Name][mod.Acronym] = mod;
        }
    }
}