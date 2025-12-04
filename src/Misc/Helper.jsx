import Config from '../Data/Config.json';
import { toast } from "react-toastify";
import { TextureDatabase } from '../Assets/Textures/TextureDatabase';
import { blue, green, pink, purple } from '@mui/material/colors';
import { HasHiddenMod, HasMod } from './ModHelper';
import ScoreData from '../Data/ScoreData.json';

export const ShowNotification = (message, severity) => {
    toast[severity](message, Config.NOTIFICATIONS);
};

export const DateToString = (date) => {
    //Convert date object to "DD/MM/YYYY HH:MM (Timezone)" format, timezone would be UTC+9 for example, no commas
    if (!date) return 'N/A';

    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
    };

    return new Intl.DateTimeFormat('en-GB', options).format(date).replace(/,/g, '');
}

export const FormatNumber = (number) => {
    return new Intl.NumberFormat().format(number);
}

export const FormatNumberWithPrecision = (number, precision) => {
    return new Intl.NumberFormat(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision }).format(number);
}

export const FormatDuration = (seconds, style = 'narrow') => {
    const duration = {
        years: Math.floor(seconds / 31536000),
        days: Math.floor((seconds % 31536000) / 86400),
        hours: Math.floor((seconds % 86400) / 3600),
        minutes: Math.floor((seconds % 3600) / 60),
        seconds: Math.floor(seconds % 60)
    }

    if (style === 'raw') {
        return duration;
    }

    return new Intl.DurationFormat('en', { style: style }).format(duration);
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

export const TimeAgo = (date, detailed = false) => {
    //smart time ago function (pick largest unit, and if detailed, show next every next unit as well)
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
        return interval + " year" + (interval > 1 ? "s" : "") + (detailed ? detailedTimeAgo(seconds % 31536000) : " ago");
    }

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
        return interval + " month" + (interval > 1 ? "s" : "") + (detailed ? detailedTimeAgo(seconds % 2592000) : " ago");
    }

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
        return interval + " day" + (interval > 1 ? "s" : "") + (detailed ? detailedTimeAgo(seconds % 86400) : " ago");
    }

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
        return interval + " hour" + (interval > 1 ? "s" : "") + (detailed ? detailedTimeAgo(seconds % 3600) : " ago");
    }

    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
        return interval + " minute" + (interval > 1 ? "s" : "") + (detailed ? detailedTimeAgo(seconds % 60) : " ago");
    }

    return Math.floor(seconds) + " second" + (seconds > 1 ? "s" : "") + " ago";
}

export const displayRank = {
    "D": "D",
    "C": "C",
    "B": "B",
    "A": "A",
    "S": "S",
    "SH": "S",
    "X": "SS",
    "XH": "SS"
}

export const rankCutoffs = (score) => {
    const hasCL = score.mods && HasMod(score.mods, "CL");
    const ruleset = score.ruleset || GetRulesetIconFromId(score.ruleset_id);

    let absoluteCutoffs = [];

    if (hasCL) {
        switch (ruleset) {
            case 'fruits':
                absoluteCutoffs = [0, 0.8501, 0.9001, 0.9401, 0.9801, 0.99, 1];
                break;

            case 'mania':
                absoluteCutoffs = [0, 0.7, 0.8, 0.9, 0.95, 0.99, 1];
                break;

            case 'osu':
                absoluteCutoffs = [0, 0.6, 0.8, 0.867, 0.933, 0.99, 1];
                break;

            case 'taiko':
                absoluteCutoffs = [0, 0.6, 0.75, 0.833, 0.917, 0.99, 1];
                break;
        }
    } else {
        switch (ruleset) {
            case 'fruits':
                absoluteCutoffs = [0, 0.85, 0.9, 0.94, 0.98, 0.99, 1];
                break;

            case 'mania':
            case 'osu':
            case 'taiko':
                absoluteCutoffs = [0, 0.7, 0.8, 0.9, 0.95, 0.99, 1];
                break;
        }
    }

    return differenceBetweenConsecutiveElements(absoluteCutoffs);
}

function differenceBetweenConsecutiveElements(arr) {
    const result = [];

    for (let i = 1; i < arr.length; i++) {
        result.push(arr[i] - arr[i - 1]);
    }

    return result;
}

export function GetGradeFromAccuracy(score, accuracy) {
    const cutoffs = ScoreData.accuracyCutoffs;
    let grade;

    if (accuracy >= cutoffs.x) {
        grade = 'X';
    } else if (accuracy >= cutoffs.s) {
        grade = 'S';
    } else if (accuracy >= cutoffs.a) {
        grade = 'A';
    } else if (accuracy >= cutoffs.b) {
        grade = 'B';
    } else if (accuracy >= cutoffs.c) {
        grade = 'C';
    } else {
        grade = 'D';
    }

    
    if(score.ruleset_id === 3){ //mania specific
        if(grade === "S") {
            const anyImperfect = 
                score.maximum_statistics_good > 0 ||
                score.maximum_statistics_ok > 0 ||
                score.maximum_statistics_meh > 0 ||
                score.maximum_statistics_miss > 0;

            grade = anyImperfect ? grade : 'X';
        }
    }else {
        if( grade === 'S' && score.maximum_statistics_miss > 0){
            grade = 'A';
        }
    }

    if((grade === 'X' || grade === 'S') && HasHiddenMod(score.mods)){
        grade += 'H';
    }


    return grade;
}

