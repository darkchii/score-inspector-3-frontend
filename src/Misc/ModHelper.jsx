import ModData from "../Data/Mods.json";
import { FormatNumber, FormatNumberWithPrecision } from "./Helper";

const _modDatabase = {};

export function GetModData(ruleset, acronym) {
    if (Object.keys(_modDatabase).length === 0) {
        BuildDatabase();
    }

    if (_modDatabase[ruleset] && _modDatabase[ruleset][acronym]) {
        return _modDatabase[ruleset][acronym];
    }
}

export function GetModExtendedContent(mod, data) {
    if (!mod || !data) return null;

    switch (mod.acronym) {
        case 'DT':
        case 'NC':
        case 'HT':
        case 'DC':
            {
                if (!mod.settings || !mod.settings.speed_change) return null;
                const speedChange = mod.settings.speed_change;
                return `${FormatNumberWithPrecision(mod.settings.speed_change)}x`
            }
        default:
            return null;
    }
}

//Builds a better lookup database for mods
function BuildDatabase() {
    for (const ruleset in ModData) {
        _modDatabase[ModData[ruleset].Name] = {};
        for (const mod of ModData[ruleset].Mods) {
            _modDatabase[ModData[ruleset].Name][mod.Acronym] = mod;
        }
    }
}