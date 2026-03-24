import PageNotFoundKirino from './kirino-oreimo.gif';

import RulesetCatchIcon from './icons/RulesetCatch.png';
import RulesetManiaIcon from './icons/RulesetMania.png';
import RulesetOsuIcon from './icons/RulesetOsu.png';
import RulesetTaikoIcon from './icons/RulesetTaiko.png';

import SVGGradeA from './grades/GradeSmall-A.svg';
import SVGGradeB from './grades/GradeSmall-B.svg';
import SVGGradeC from './grades/GradeSmall-C.svg';
import SVGGradeD from './grades/GradeSmall-D.svg';
import SVGGradeF from './grades/GradeSmall-F.svg';
import SVGGradeS from './grades/GradeSmall-S.svg';
import SVGGradeSH from './grades/GradeSmall-S-Silver.svg';
import SVGGradeX from './grades/GradeSmall-SS.svg';
import SVGGradeXH from './grades/GradeSmall-SS-Silver.svg';

import CompletionistStandard from './completionists/standard.png';
import CompletionistTaiko from './completionists/taiko.png';
import CompletionistCatch from './completionists/catch.png';
import CompletionistMania from './completionists/mania.png';
import { GetRulesetNameFromId } from '../../util/Helper';

//Import EVERYTHING from ./Flags/ (country flags, its not feasible to do manually)

//do it here

export function getFlagIcon(country_code: string | null | undefined){
    //get flag icons (dynamic import)
    if(country_code === null || country_code === undefined){
        country_code = '__';
    }
    country_code = country_code.toUpperCase();
    try {
        // const flag = import(`../Assets/Flags/${country_code}.png`);
        const path = `./flags/${country_code}.png`;
        const flag_modules = import.meta.glob<{ default: string }>('./flags/*.png', {
            eager: true
        });
        return flag_modules[path].default;
    } catch (err) {
        console.error(err);
        return null;
    }
}

export function getGradeIcon(grade: string | null | undefined){
    switch(grade){
        case 'XH':
            return SVGGradeXH;
        case 'X':
            return SVGGradeX;
        case 'SH':
            return SVGGradeSH;
        case 'S':
            return SVGGradeS;
        case 'A':
            return SVGGradeA;
        case 'B':
            return SVGGradeB;
        case 'C':
            return SVGGradeC;
        case 'D':
            return SVGGradeD;
        case 'F':
            return SVGGradeF;
        default:
            return null;
    }
}

export function getCompletionistBadge(ruleset: number | string){
    switch(ruleset){
        case 'osu':
        case 0:
        case '0':
            return CompletionistStandard;
        case 'taiko':
        case 1:
        case '1':
            return CompletionistTaiko;
        case 'fruits':
        case 2:
        case '2':
            return CompletionistCatch;
        case 'mania':
        case 3:
        case '3':
            return CompletionistMania;
        default:
            return null;
    }
}

export const TextureDatabase = {
    PageNotFoundKirino,
    RulesetCatchIcon,
    RulesetManiaIcon,
    RulesetOsuIcon,
    RulesetTaikoIcon,
    SVGGradeA,
    SVGGradeB,
    SVGGradeC,
    SVGGradeD,
    SVGGradeF,
    SVGGradeS,
    SVGGradeSH,
    SVGGradeX,
    SVGGradeXH,
    CompletionistStandard,
    CompletionistTaiko,
    CompletionistCatch,
    CompletionistMania,
};