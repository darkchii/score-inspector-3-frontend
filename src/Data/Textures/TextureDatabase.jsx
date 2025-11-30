import PageNotFoundKirino from './kirino-oreimo.gif';

import RulesetCatchIcon from './Icons/RulesetCatch.png';
import RulesetManiaIcon from './Icons/RulesetMania.png';
import RulesetOsuIcon from './Icons/RulesetOsu.png';
import RulesetTaikoIcon from './Icons/RulesetTaiko.png';

import SVGGradeA from './Grades/GradeSmall-A.svg';
import SVGGradeB from './Grades/GradeSmall-B.svg';
import SVGGradeC from './Grades/GradeSmall-C.svg';
import SVGGradeD from './Grades/GradeSmall-D.svg';
import SVGGradeF from './Grades/GradeSmall-F.svg';
import SVGGradeS from './Grades/GradeSmall-S.svg';
import SVGGradeSH from './Grades/GradeSmall-S-Silver.svg';
import SVGGradeX from './Grades/GradeSmall-SS.svg';
import SVGGradeXH from './Grades/GradeSmall-SS-Silver.svg';

//Import EVERYTHING from ./Flags/ (country flags, its not feasible to do manually)

//do it here

export function getFlagIcon(country_code){
    //get flag icons (dynamic import)
    if(country_code === null || country_code === undefined){
        country_code = '__';
    }
    country_code = country_code.toUpperCase();
    try {
        // const flag = import(`../Assets/Flags/${country_code}.png`);
        const path = `./Flags/${country_code}.png`;
        const flag_modules = import.meta.glob('./Flags/*.png', {
            eager: true
        });
        return flag_modules[path].default;
    } catch (err) {
        console.error(err);
        return null;
    }
}

export function getGradeIcon(grade){
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
};