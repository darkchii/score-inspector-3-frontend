import * as d3 from 'd3';
import { displayRank, GetGradeFromAccuracy, rankCutoffs } from '../Misc/Helper';
import { animated, useSpring } from '@react-spring/web';
import { useState } from 'react';
import dialStyles from '../Style/dial.module.less';

function ScoreDial({ score }) {
    const arc = d3.arc();
    const pie = d3.pie().sortValues(null);

    const [displayedRank, setDisplayedRank] = useState("D");
    const _rankCutoffs = rankCutoffs(score);
    const springData = useSpring({
        from: {
            pos: [0]
        },
        to: {
            //radians
            pos: [((score?.accuracy || 0) * 360) * (Math.PI / 180)]
        },
        config: {
            duration: 1250,
            easing: d3.easeQuadInOut,
        },
        onChange: (result) => {
            if (!score) return;
            // setDisplayedRank(rankCutoffs(Mods.hasMod(props.mods, "CL")));
            const rad = result.value.pos[0];
            const progress = rad / (2 * Math.PI);
            const grade = GetGradeFromAccuracy(score, progress);
            setDisplayedRank(displayRank[grade]);
        }
    })

    return (
        <div className={dialStyles.dial}>
            <div className={dialStyles.dial__layer}>
                <svg viewBox='0 0 200 200'>
                    <defs>
                        <linearGradient gradientTransform='rotate(90)' id='dial-outer'>
                            <stop className={`${dialStyles['dial__outer_gradient']} ${dialStyles['dial__outer_gradient--start']}`} offset='0%' />
                            <stop className={`${dialStyles['dial__outer_gradient']} ${dialStyles['dial__outer_gradient--end']}`} offset='100%' />
                        </linearGradient>
                    </defs>
                    <g transform="translate(100,100)">
                        {
                            pie(_rankCutoffs).map((d) => (
                                <path
                                    key={d.index}
                                    className={`${dialStyles.dial__inner} ${dialStyles[`dial__inner--${d.index}`]}`}
                                    d={arc({ innerRadius: 68, outerRadius: 73, ...d }) ?? undefined}
                                />
                            ))
                        }
                        {
                            <>
                                <path
                                    key={1}
                                    className={`${dialStyles.dial__outer} ${dialStyles[`dial__outer--${1}`]}`}
                                    d={arc({ innerRadius: 75, outerRadius: 100, startAngle: 0, endAngle: 2 * Math.PI }) ?? undefined}
                                />
                                <animated.path
                                    key={0}
                                    className={`${dialStyles.dial__outer} ${dialStyles[`dial__outer--${0}`]}`}
                                    d={
                                        springData.pos.to((accuracy) => {
                                            return arc({ innerRadius: 75, outerRadius: 100, startAngle: 0, endAngle: accuracy })
                                        })
                                    }
                                />
                            </>
                        }
                    </g>
                </svg>
            </div>

            <div className={`${dialStyles.dial__layer} ${dialStyles.dial__layer__grade}`}>
                <span>{displayedRank}</span>
            </div>
        </div>
    )
}

export default ScoreDial;