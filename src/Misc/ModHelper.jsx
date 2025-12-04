import { green, red } from "@mui/material/colors";
import ModData from "../Data/Mods.json";
import { FormatNumber, FormatNumberWithPrecision, GetRulesetId } from "./Helper";
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';

const _modDatabase = {};
export function GetModData(ruleset, acronym) {
    BuildDatabase();

    if (_modDatabase[ruleset] && _modDatabase[ruleset][acronym]) {
        return _modDatabase[ruleset][acronym];
    }
}

export function GetModSettingForDisplay(ruleset, acronym, key, value) {
    BuildDatabase();
    // Gives a human friendly label for settings,
    //like true/false returning icons etc

    const modData = GetModData(ruleset, acronym);
    if (!modData || !modData.Settings) return String(value);

    const settingData = modData.Settings.find(s => s.Name === key);

    if (!settingData) return String(value);
    // console.log(settingData);


    switch (settingData?.Type) {
        case 'boolean':
            return value ? <CheckIcon fontSize="small" sx={{ verticalAlign: 'middle', color: green[500] }} /> : <CloseIcon fontSize="small" sx={{ verticalAlign: 'middle', color: red[500] }} />;
        case 'number':
            return FormatNumberWithPrecision(value, 2);
        default:
            return String(value);
    }
}

export function ReorderMods(ruleset, mods) {
    BuildDatabase();

    if (!_modDatabase[ruleset]) return mods;

    return mods.slice().sort((a, b) => {
        const mod_a_from_db = _modDatabase[ruleset][a.acronym];
        const mod_b_from_db = _modDatabase[ruleset][b.acronym];

        if (!mod_a_from_db || !mod_b_from_db) return 0;

        const index_a = ModData[GetRulesetId(ruleset)].Mods.findIndex(mod => mod.acronym === mod_a_from_db.Acronym);
        const index_b = ModData[GetRulesetId(ruleset)].Mods.findIndex(mod => mod.acronym === mod_b_from_db.Acronym);

        return index_a - index_b;
    });
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
    if (Object.keys(_modDatabase).length > 0) return;

    for (const ruleset in ModData) {
        _modDatabase[ModData[ruleset].Name] = {};
        for (const mod of ModData[ruleset].Mods) {
            _modDatabase[ModData[ruleset].Name][mod.Acronym] = mod;
        }
    }
}

export function HasMod(mods, acronym) {
    return mods.some(mod => mod.acronym === acronym);
}

export function HasHiddenMod(mods) {
    //HD, FL, FI (these mods give silver grades)
    return mods.some(mod => ['HD', 'FL', 'FI'].includes(mod.acronym));
}