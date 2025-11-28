import Config from '../Data/Config.json';
import { toast } from "react-toastify";
import { TextureDatabase } from '../Data/Textures/TextureDatabase';
import { blue, green, pink, purple } from '@mui/material/colors';

export const ShowNotification = (message, severity) => {
    toast[severity](message, Config.NOTIFICATIONS);
};

export const FormatNumber = (number) => {
    return new Intl.NumberFormat().format(number);
}

export const GetRulesetIconFromId = (rulesetId) => {
    switch (rulesetId) {
        default:
        case 0:
            return TextureDatabase.RulesetOsuIcon;
        case 1:
            return TextureDatabase.RulesetTaikoIcon;
        case 2:
            return TextureDatabase.RulesetCatchIcon;
        case 3:
            return TextureDatabase.RulesetManiaIcon;
    }
}

export const GetRulesetColor = (ruleset) => {
    const _ruleset = typeof ruleset === 'string' ? ruleset.toLowerCase() : null;

    switch (_ruleset) {
        default:
        case 'osu':
            return pink;
        case 'taiko':
            return green;
        case 'fruits':
            return blue;
        case 'mania':
            return purple;
    }
}

export const GetRulesetNameFromId = (rulesetId) => {
    switch (rulesetId) {
        default:
        case 0:
        case '0':
        case 'osu':
            return 'osu';
        case 1:
        case '1':
        case 'taiko':
            return 'taiko';
        case 2:
        case '2':
        case 'fruits':
            return 'fruits';
        case 3:
        case '3':
        case 'mania':
            return 'mania';
        case 'all':
        case 'total':
            return 'total';
    }
}

export const GetRulesetId = (rulesetName) => {
    switch (rulesetName) {
        default:
        case 'osu':
            return 0;
        case 'taiko':
            return 1;
        case 'fruits':
            return 2;
        case 'mania':
            return 3;
    }
}

export const GetRulesets = () => {
    return [
        {
            id: 0,
            name: 'osu',
            displayName: 'osu!',
            icon: TextureDatabase.RulesetOsuIcon
        },
        {
            id: 1,
            name: 'taiko',
            displayName: 'Taiko',
            icon: TextureDatabase.RulesetTaikoIcon
        },
        {
            id: 2,
            name: 'fruits',
            displayName: 'Catch the Beat',
            icon: TextureDatabase.RulesetCatchIcon
        },
        {
            id: 3,
            name: 'mania',
            displayName: 'Mania',
            icon: TextureDatabase.RulesetManiaIcon
        },
    ]
}

export const getContrastColor = (bgColor) => {
    // Calculate the luminance of the background color
    const color = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor;
    const r = parseInt(color.substring(0, 2), 16) / 255;
    const g = parseInt(color.substring(2, 4), 16) / 255;
    const b = parseInt(color.substring(4, 6), 16) / 255;
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    // Return black for light backgrounds and white for dark backgrounds
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export const calculateRawPerformance = (scores) => {
    //Sort scores by performance descending
    scores.sort((a, b) => b.pp - a.pp);
    //Use top 500 scores only

    const topScores = scores.slice(0, 500);
    let totalPerformance = 0;
    topScores.forEach((score, index) => {
        const weight = Math.pow(0.95, index);
        totalPerformance += score.pp * weight;
    });
    return totalPerformance;
}

export const calculateBonusPerformance = (scoreCount) => {
    return 416.6667 * (1 - Math.pow(0.9995, Math.min(scoreCount, 1000)));
}