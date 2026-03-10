import Config from '../data/Config.json';
import { toast, type ToastOptions } from "react-toastify";
import { TextureDatabase } from '../assets/textures/TextureDatabase';
import { blue, green, pink, purple } from '@mui/material/colors';
import { HasHiddenMod, HasMod } from './ModHelper';
import ScoreData from '../data/ScoreData.json';
import NumberFlow from '@number-flow/react';
import * as Muicon from "@mui/icons-material";
import { IScore } from '../types/types';

type DurationParts = {
    years: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
};

export const ShowNotification = (message: string, severity: "info" | "success" | "warning" | "error") => {
    toast[severity](message, Config.NOTIFICATIONS as ToastOptions);
};

export const DateToString = (date: Date | null): string => {
    //Convert date object to "DD/MM/YYYY HH:MM (Timezone)" format, timezone would be UTC+9 for example, no commas
    if (!date) return 'N/A';

    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
    };

    return new Intl.DateTimeFormat('en-GB', options).format(date).replace(/,/g, '');
}

export const FormatNumber = (number: number) => {
    return new Intl.NumberFormat().format(number);
}

export const FormatNumberWithPrecision = (number: number, precision: number) => {
    return new Intl.NumberFormat(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision }).format(number);
}

export const FormatDuration = (seconds: number, style: 'narrow' | 'short' | 'long' | 'raw' = 'narrow', highest_tier: 'years' | 'days' | 'hours' | 'minutes' | 'seconds' | null = null) => {
    const duration: DurationParts = {
        years: Math.floor(seconds / 31536000),
        days: Math.floor((seconds % 31536000) / 86400),
        hours: Math.floor((seconds % 86400) / 3600),
        minutes: Math.floor((seconds % 3600) / 60),
        seconds: Math.floor(seconds % 60)
    }

    //reprocess to highest tier (so if highest tier is days, sum up the years into days, dont touch the rest since they remain the same)
    if (highest_tier) {
        switch (highest_tier) {
            case 'days':
                duration.days += duration.years * 365;
                duration.years = 0;
                break;
            case 'hours':
                duration.hours += (duration.years * 365 + duration.days) * 24;
                duration.days = 0;
                duration.years = 0;
                break;
            case 'minutes':
                duration.minutes += ((duration.years * 365 + duration.days) * 24 + duration.hours) * 60;
                duration.hours = 0;
                duration.days = 0;
                duration.years = 0;
                break;
            case 'seconds':
                duration.seconds += (((duration.years * 365 + duration.days) * 24 + duration.hours) * 60 + duration.minutes) * 60;
                duration.minutes = 0;
                duration.hours = 0;
                duration.days = 0;
                duration.years = 0;
                break;
        }
    }

    if (style === 'raw') {
        return duration;
    }

    const IntlWithDurationFormat = Intl as typeof Intl & {
        DurationFormat?: new (locale: string, options: { style: string }) => { format: (value: unknown) => string }
    };

    if (IntlWithDurationFormat.DurationFormat) {
        return new IntlWithDurationFormat.DurationFormat('en', { style: style }).format(duration);
    }

    return `${duration.years}y ${duration.days}d ${duration.hours}h ${duration.minutes}m ${duration.seconds}s`;
}

export const FormatDurationNumberFlow = (seconds: number, spacing: boolean = true, highest_tier: 'years' | 'days' | 'hours' | 'minutes' | 'seconds' | null = null) => {
    //Format duration with all numeric values in NumberFlow components
    const duration = FormatDuration(seconds, 'raw', highest_tier) as DurationParts;

    let formatted = <></>;

    if (duration.years > 0) {
        formatted = <>
            {formatted}
            <NumberFlow value={duration.years} suffix={spacing ? 'y ' : 'y'} />
        </>;
    }

    if (duration.days > 0) {
        formatted = <>
            {formatted}
            <NumberFlow value={duration.days} suffix={spacing ? 'd ' : 'd'} />
        </>;
    }

    if (duration.hours > 0) {
        formatted = <>
            {formatted}
            <NumberFlow value={duration.hours} suffix={spacing ? 'h ' : 'h'} prefix={duration.hours < 10 && duration.days == 0 ? '0' : ''} />
        </>;
    }

    if (duration.minutes > 0) {
        formatted = <>
            {formatted}
            <NumberFlow value={duration.minutes} suffix={spacing ? 'm ' : 'm'} prefix={duration.minutes < 10 && duration.hours == 0 ? '0' : ''} />
        </>;
    }

    if (duration.seconds > 0 || formatted === <></>) {
        formatted = <>
            {formatted}
            <NumberFlow value={duration.seconds} suffix={spacing ? 's' : 's'} prefix={duration.seconds < 10 && duration.minutes == 0 ? '0' : ''} />
        </>;
    }

    return formatted;
}

export const GetRulesetIconFromId = (rulesetId: number) => {
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

export const GetRulesetColor = (ruleset: string) => {
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

export const GetRulesetNameFromId = (rulesetId: number | string) => {
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

export const GetRulesetPrettyNameFromId = (rulesetId: number | string) => {
    switch (rulesetId) {
        default:
        case 0:
        case '0':
        case 'osu':
            return 'osu!standard';
        case 1:
        case '1':
        case 'taiko':
            return 'osu!taiko';
        case 2:
        case '2':
        case 'fruits':
            return 'osu!catch';
        case 3:
        case '3':
        case 'mania':
            return 'osu!mania';
        case 'all':
        case 'total':
            return 'total';
    }
}

export const GetRulesetId = (rulesetName: string) => {
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

export const GetStatusLabelFromInt = (status: number) => {
    switch (status) {
        default:
        case 0:
            return 'Unranked';
        case 1:
            return 'Ranked';
        case 2:
            return 'Approved';
        case 3:
            return 'Qualified';
        case 4:
            return 'Loved';
    }
}

export const getContrastColor = (bgColor: string): string => {
    // Calculate the luminance of the background color
    const color = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor;
    const r = parseInt(color.substring(0, 2), 16) / 255;
    const g = parseInt(color.substring(2, 4), 16) / 255;
    const b = parseInt(color.substring(4, 6), 16) / 255;
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    // Return black for light backgrounds and white for dark backgrounds
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

const detailedTimeAgo = (seconds: number): string => {
    if (!seconds || seconds <= 0) {
        return " ago";
    }

    const units = [
        { label: 'month', value: 2592000 },
        { label: 'day', value: 86400 },
        { label: 'hour', value: 3600 },
        { label: 'minute', value: 60 },
        { label: 'second', value: 1 },
    ];

    const parts = [];
    let remaining = seconds;

    for (const unit of units) {
        const amount = Math.floor(remaining / unit.value);
        if (amount > 0) {
            parts.push(`${amount} ${unit.label}${amount > 1 ? 's' : ''}`);
            remaining %= unit.value;
        }

        if (parts.length === 2) {
            break;
        }
    }

    return parts.length > 0 ? `, ${parts.join(' ')} ago` : " ago";
}

export const TimeAgo = (date: Date | string, detailed: boolean = false): string => {
    //smart time ago function (pick largest unit, and if detailed, show next every next unit as well)
    const now = new Date();
    const dateValue = date instanceof Date ? date.getTime() : new Date(date).getTime();
    const seconds = Math.floor((now.getTime() - dateValue) / 1000);

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

export const displayRank: { [key: string]: string } = {
    "D": "D",
    "C": "C",
    "B": "B",
    "A": "A",
    "S": "S",
    "SH": "S",
    "X": "SS",
    "XH": "SS"
}

export const rankCutoffs = (score: IScore): number[] => {
    const hasCL = score.mods && HasMod(score.mods, "CL");
    const ruleset = score.ruleset || GetRulesetIconFromId(score.ruleset_id);

    let absoluteCutoffs: number[] = [];

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

function differenceBetweenConsecutiveElements(arr: number[]): number[] {
    const result: number[] = [];

    for (let i = 1; i < arr.length; i++) {
        result.push(arr[i] - arr[i - 1]);
    }

    return result;
}

function GetGradeFromAccuracyBase(accuracy: number, ruleset: string = 'osu'): string {
    const cutoffs = ScoreData.accuracyCutoffs[ruleset];
    let grade: string;

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

    return grade;
}

export function GetGradeFromAccuracy(score: IScore, accuracy: number): string {
    let grade = GetGradeFromAccuracyBase(accuracy);

    switch (score.ruleset) {
        case 'osu':
        case 'taiko':
            switch (grade) {
                case 'S':
                case 'X':
                    //if miss > 0, downgrade to A
                    if (score.statistics_miss > 0) {
                        grade = 'A';
                    }
                    break;
            }
            break;
        case 'fruits':
            grade = GetGradeFromAccuracyBase(accuracy, 'fruits');
            break;
        case 'mania':
            if (grade === 'S') {
                const anyImperfect =
                    score.statistics_good > 0 ||
                    score.statistics_ok > 0 ||
                    score.statistics_meh > 0 ||
                    score.statistics_miss > 0;

                grade = anyImperfect ? grade : 'X';
            }
            break;
    }

    if (grade === 'S' || grade === 'X') {
        //check for hidden mod
        if (HasHiddenMod(score.mods)) {
            grade += 'H';
        }
    }

    return grade;
}

export function GetGradeColor(grade: string): string {
    switch (grade) {
        default:
            return '#ffffff';
        case 'XH':
            return '#C0C0C0';
        case 'X':
            return '#E8BF3F';
        case 'SH':
            return '#C0C0C0';
        case 'S':
            return '#E8BF3F';
        case 'A':
            return '#72B75D';
        case 'B':
            return '#384699';
        case 'C':
            return '#50367a';
        case 'D':
            return '#7a1f1f';
    }
}

export function HexToRgb(hex: string): [number, number, number] | null {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    //return as [r, g, b]
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
}

//gets any icon from mui icon by its name
export function GetIconFromLabel(label: string) {
    const IconComponent = Muicon[label];
    return IconComponent ? <IconComponent /> : null;
}

//like keyPath = ['beatmap', 'difficulty_data', 'star_rating']
export function GetNestedValue(obj: any, keyPath: string | string[]): any {
    if (typeof keyPath === 'string') {
        keyPath = keyPath.split('.');
    }
    return keyPath.reduce((accumulator, currentKey) => {
        return accumulator ? accumulator[currentKey] : null;
    }, obj);
}

export function readFileAsync(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();

        reader.onload = () => {
            resolve(reader.result as ArrayBuffer);
        };

        reader.onerror = reject;

        reader.readAsArrayBuffer(file);
    })
}
