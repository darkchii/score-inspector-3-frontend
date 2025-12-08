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

export function GetMod(mods, acronym) {
    return mods.find(mod => mod.acronym === acronym);
}

export function GetModSetting(mods, acronym, key) {
    const mod = GetMod(mods, acronym);
    if (!mod || !mod.settings) return null;
    return mod.settings[key];
}

export function CalculateRateWithMods(time, mods, difficulty_attributes) {
    let rate = 1.0;

    for (const mod of mods) {
        switch (mod.acronym) {
            //Adaptive Speed
            case 'AS':
                rate *= mod.settings?.initial_rate ?? 1.0;
                break;
            //Double Time / Nightcore
            case 'DT':
            case 'NC':
                rate *= mod.settings?.speed_change ?? 1.5;
                break;
            //Half Time / Daycore
            case 'HT':
            case 'DC':
                rate *= mod.settings?.speed_change ?? 0.75;
                break;
            //Wind Up / Wind Down (complicated)
            case 'WU':
            case 'WD':
                rate *= GetTimeRampRate(mod, time, difficulty_attributes.first_object_start_time, difficulty_attributes.last_object_end_time);
                break;
            default:
                break;
        }
    }

    return rate;
}

function GetTimeRampRate(mod, time, firstObjectStart, lastObjectEnd) {
    let initial_rate = mod.settings?.initial_rate ?? 1.0;
    let final_rate = mod.settings?.final_rate ?? (mod.acronym === 'WU' ? 1.0 : 0.75);

    let beginRampTime = firstObjectStart;
    let finalRateTime = firstObjectStart + 0.75 *(lastObjectEnd - firstObjectStart);

    let amount = (time - beginRampTime) / Math.max(1, finalRateTime - beginRampTime);
    let ramp = initial_rate + (final_rate - initial_rate) * Math.min(Math.max(amount, 0), 1);

    return Math.round(ramp * 100) / 100;
}

export function CalculateVisibilityBonus(mods, approach_rate, visibility_factor = 1, slider_factor = 1) {
    //if mode has HD + setting only_fade_approach_circles, or if TC
    let isAlwaysPartiallyVisible = mods.some(mod => (mod.acronym === 'HD' && mod.settings?.only_fade_approach_circles) || mod.acronym === 'TC');

    let readingBonus = (isAlwaysPartiallyVisible ? 0.025 : 0.04) * (12 - Math.max(approach_rate, 7));

    readingBonus *= visibility_factor;

    let sliderVisibilityFactor = Math.pow(slider_factor, 3);

    if(approach_rate < 7){
        readingBonus += (isAlwaysPartiallyVisible ? 0.02 : 0.045) * (7 - Math.max(approach_rate, 0)) * sliderVisibilityFactor;
    }

    if(approachRate < 0){
        readingBonus += (isAlwaysPartiallyVisible ? 0.01 : 0.1) * (1 - Math.pow(1.5, approach_rate)) * sliderVisibilityFactor;
    }

    return readingBonus;
}