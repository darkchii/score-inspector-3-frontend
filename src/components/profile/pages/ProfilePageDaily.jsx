import { Box, Button, ButtonGroup, Collapse, Divider, Grid, useTheme } from "@mui/material";
import { useProfile } from "../../../providers/ProfileProvider";
import { useEffect, useState } from "react";
import dateGridStyles from '../../../styles/date-grid.module.less';
import colorStyles from '../../../styles/colors.module.less';
import BetterTooltip from "../../tooltips/BetterTooltip";
import { HexToRgb } from "../../../util/Helper";
import GradesDisplay from "../../GradesDisplay";
import NumberFlow from "@number-flow/react";
import ScoreList from "../../ScoreList";
import ProfileDailyChart from "./daily/ProfileDailyChart";

const chartDefinitions = {
    pp: { value: 'pp', nesting: ['implied_pp'], label: 'Performance', yFormat: (y) => y.toFixed(2) + 'pp' },
    score: { value: 'score', nesting: ['implied_total_score'], label: 'Score', yFormat: (y) => y.toLocaleString('en-US') },
    accuracy: { value: 'accuracy', nesting: ['accuracy'], label: 'Accuracy', yFormat: (y) => (y * 100).toFixed(2) + '%' },
    combo: { value: 'combo', nesting: ['combo'], label: 'Combo', yFormat: (y) => y.toLocaleString('en-US') + 'x' },
    length: { value: 'length', nesting: ['local_beatmap', 'length_modded'], label: 'Length', yFormat: (y) => `${Math.floor(y / 60)}:${(y % 60).toString().padStart(2, '0')}` },
    sr: { value: 'sr', nesting: ['attr_diff', 'star_rating'], label: 'Stars', yFormat: (y) => y.toFixed(2) + '★' },
    // { value: 'cs', nesting: ['beatmap', 'difficulty_data', 'modded_cs'], label: 'CS', yFormat: (y) => y.toFixed(2) },
    // { value: 'ar', nesting: ['beatmap', 'difficulty_data', 'modded_ar'], label: 'AR', yFormat: (y) => y.toFixed(2) },
    // { value: 'od', nesting: ['beatmap', 'difficulty_data', 'modded_od'], label: 'OD', yFormat: (y) => y.toFixed(2) },
    // { value: 'hp', nesting: ['beatmap', 'difficulty_data', 'modded_hp'], label: 'HP', yFormat: (y) => y.toFixed(2) },
};

//uses periodic_by_year from the ProfileRulesetStatistics type
function ProfilePageDaily() {
    const { getRulesetStatistics, activeRuleset } = useProfile();

    const [activeDisplayChart, setActiveDisplayChart] = useState(chartDefinitions.pp.value);

    const [statDatabase, setStatDatabase] = useState(null);
    const [yearRange, setYearRange] = useState(5);
    const [activeDisplayYear, setActiveDisplayYear] = useState(new Date().getUTCFullYear());

    const [activeYearData, setActiveYearData] = useState(null);

    //These 2 are to make sure the selection persists when switching display years
    const [activeDate, setActiveDate] = useState(null);

    useEffect(() => {
        console.log(activeYearData?.[activeDate]); //debug
    }, [activeDate])

    useEffect(() => {
        const profileStatistics = getRulesetStatistics(activeRuleset);
        if (profileStatistics) {
            setStatDatabase(profileStatistics);
            const years = Object.keys(profileStatistics.periodic_by_year).map(y => parseInt(y)).sort((a, b) => a - b);
            if (years.length > 0) {
                setActiveDisplayYear(years[years.length - 1]);
            }

            //set year range to max - min
            if (years.length > 1) {
                setYearRange(years[years.length - 1] - years[0] + 1);
            } else {
                setYearRange(1);
            }

            //find newest entry in .periodic['daily'] to set active date to
            const dailyData = profileStatistics.periodic?.['daily'];
            if (dailyData) {
                const dailyDates = Object.keys(dailyData).sort((a, b) => new Date(b) - new Date(a));
                if (dailyDates.length > 0) {
                    setActiveDate(dailyDates[0]);
                }
            }
        }
    }, [activeRuleset]);

    useEffect(() => {
        const profileStatistics = getRulesetStatistics(activeRuleset);
        if (profileStatistics && profileStatistics.periodic_by_year[activeDisplayYear]) {
            //we only care for daily
            let dailyData = profileStatistics.periodic_by_year[activeDisplayYear]['daily'];
            setActiveYearData(dailyData);
        } else {
            setActiveYearData(null);
        }
    }, [activeDisplayYear, activeRuleset]);

    if (!getRulesetStatistics(activeRuleset)) {
        return <div>No data available.</div>
    }

    return (
        <div style={{
            padding: '16px',
        }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ButtonGroup>
                    {
                        Array.from({ length: yearRange }, (_, i) => {
                            const profileStatistics = getRulesetStatistics(activeRuleset);
                            if (!profileStatistics) return null;

                            const years = Object.keys(profileStatistics.periodic_by_year).map(y => parseInt(y)).sort((a, b) => a - b);
                            const year = years[i];
                            if (!year) return null;

                            return (<Button
                                key={year}
                                onClick={() => setActiveDisplayYear(year)}
                                disabled={activeDisplayYear === year}
                            >
                                {year}
                            </Button>);
                        })
                    }
                </ButtonGroup>
            </div>
            <div>
                <DateGrid year={activeDisplayYear} data={activeYearData} activeDate={activeDate} onDateSelected={setActiveDate} />
            </div>
            <div>
                {
                    //if activeDate is set, and it exists in activeYearData, show details
                    activeDate && activeYearData && statDatabase?.periodic?.['daily']?.[activeDate] ? (
                        <Collapse in={statDatabase?.periodic?.['daily']?.[activeDate] != null} unmountOnExit>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}>
                                <ButtonGroup sx={{ mb: 2 }}>
                                    {
                                        Object.values(chartDefinitions).map((chartDef) => (
                                            <Button
                                                key={chartDef.value}
                                                onClick={() => setActiveDisplayChart(chartDef.value)}
                                                disabled={activeDisplayChart === chartDef.value}
                                            >
                                                {chartDef.label}
                                            </Button>
                                        ))
                                    }
                                </ButtonGroup>
                                <ProfileDailyChart scores={statDatabase?.periodic?.['daily']?.[activeDate].scores} date={activeDate} chartData={chartDefinitions[activeDisplayChart]} />
                                <Divider sx={{ width: '100%', my: 2 }} />
                                <GradesDisplay grades={statDatabase?.periodic?.['daily']?.[activeDate].grades} />
                                <Divider sx={{ width: '100%', my: 2 }} />
                                <ScoreList
                                    scores={statDatabase?.periodic?.['daily']?.[activeDate].scores_reordered?.['date']} truncate={true}
                                />
                            </div>
                        </Collapse>
                    ) : (
                        <Collapse in={statDatabase?.periodic?.['daily']?.[activeDate] == null} unmountOnExit>
                            <p>Select a date to see details.</p>
                        </Collapse>
                    )
                }
            </div>
        </div>
    )
}

const ABSOLUTE_RANGE_LIMIT = 100;
function DateGrid({ year, data, activeDate = null, onDateSelected = null }) {
    const theme = useTheme();

    const startSquareColor = HexToRgb('#1a1a1a');
    const endSquareColor = HexToRgb(theme.palette.primary.main);

    const [gridData, setGridData] = useState(null);
    const [isLeapYear, setIsLeapYear] = useState(false);
    const [dayOffset, setDayOffset] = useState(0);
    const [maxClears, setMaxClears] = useState(0);

    useEffect(() => {
        //check if year is leap year
        if ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)) {
            setIsLeapYear(true);
        } else {
            setIsLeapYear(false);
        }

        //calculate amount of offset days (if year starts on a day other than sunday)
        const firstDay = new Date(Date.UTC(year, 0, 1));
        setDayOffset(firstDay.getUTCDay());
    }, [year]);

    useEffect(() => {
        //reformats it so more easily accessible
        let temp = {};
        if (data) {
            let _maxClears = 0;
            for (const dateString in data) {
                temp[dateString] = data[dateString];

                //find the max clears for color scaling
                if (data[dateString].clears > _maxClears) {
                    _maxClears = data[dateString].clears;
                }
            }
            setMaxClears(_maxClears);
            setGridData(temp);
        } else {
            setGridData(null);
        }
    }, [data]);

    return (
        <>
            <Box sx={{ pt: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className={dateGridStyles['date-grid']}>
                    <div className={dateGridStyles['date-grid__months']}>
                        <li>Jan</li>
                        <li>Feb</li>
                        <li>Mar</li>
                        <li>Apr</li>
                        <li>May</li>
                        <li>Jun</li>
                        <li>Jul</li>
                        <li>Aug</li>
                        <li>Sep</li>
                        <li>Oct</li>
                        <li>Nov</li>
                        <li>Dec</li>
                    </div>
                    <div className={dateGridStyles['date-grid__days']}>
                        <li>Sun</li>
                        <li>Mon</li>
                        <li>Tue</li>
                        <li>Wed</li>
                        <li>Thu</li>
                        <li>Fri</li>
                        <li>Sat</li>
                    </div>
                    <div className={dateGridStyles['date-grid__squares']}>
                        {
                            gridData && (() => {
                                let squares = [];
                                const totalDaysInMonth = [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

                                //generate "offset" squares (otherwise the first day will always be on sunday)
                                for (let i = 0; i < dayOffset; i++) {
                                    squares.push(
                                        <div key={`offset-${i}`} className={dateGridStyles['date-grid__square--empty']}></div>
                                    );
                                }

                                for (let month = 0; month < 12; month++) {
                                    for (let day = 1; day <= totalDaysInMonth[month]; day++) {
                                        const monthString = (month + 1).toString().padStart(2, '0');
                                        const dayString = day.toString().padStart(2, '0');
                                        const dateKey = `${year}-${monthString}-${dayString}`;
                                        const dayData = gridData[dateKey];
                                        const clears = dayData ? dayData.clears : 0;
                                        const adjustedClears = Math.min(clears, ABSOLUTE_RANGE_LIMIT);

                                        //based on clears 0-maxClears/limit, interpolate from #1a1a1a to theme.palette.primary.main
                                        let progress = maxClears > ABSOLUTE_RANGE_LIMIT ? adjustedClears / ABSOLUTE_RANGE_LIMIT : (maxClears === 0 ? 0 : adjustedClears / maxClears);
                                        // let progress = Math.min(adjustedClears, 100) / 100;
                                        let color = `rgb(${Math.round(startSquareColor[0] + (endSquareColor[0] - startSquareColor[0]) * progress)}, ${Math.round(startSquareColor[1] + (endSquareColor[1] - startSquareColor[1]) * progress)}, ${Math.round(startSquareColor[2] + (endSquareColor[2] - startSquareColor[2]) * progress)})`;

                                        squares.push(
                                            <BetterTooltip key={dateKey} title={`${dateKey}: ${clears} clears`} placement='top' disableInteractive={true}>
                                                <div
                                                    style={{
                                                        '--target-color': color,
                                                        //if no clears, reset hover
                                                        '&:hover': { cursor: clears > 0 ? 'pointer' : 'default' }
                                                    }}
                                                    // className={`${dateGridStyles['date-grid__square']} ${clears > 0 ? dateGridStyles['date-grid__square--clickable'] : dateGridStyles['date-grid__square--empty']}`}
                                                    className={`${dateGridStyles['date-grid__square']} ${clears > 0 ? dateGridStyles['date-grid__square--clickable'] : dateGridStyles['date-grid__square--empty']} ${activeDate === dateKey ? dateGridStyles['date-grid__square--active'] : ''}`}
                                                    //clickable if clears > 0
                                                    onClick={() => { clears > 0 && onDateSelected && onDateSelected(dateKey); }}
                                                />
                                            </BetterTooltip>
                                        );
                                    }
                                }
                                return squares;
                            })()
                        }
                    </div>
                </div>
            </Box>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div>Legend (scores)</div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <p>0</p>
                    <div
                        style={{
                            width: '14px',
                            height: '14px',
                            backgroundColor: `rgb(${startSquareColor[0]}, ${startSquareColor[1]}, ${startSquareColor[2]})`,
                            marginRight: '4px',
                            marginLeft: '4px',
                            borderRadius: '2px',
                        }}
                    />
                    <div
                        style={{
                            width: '80px',
                            height: '14px',
                            background: `linear-gradient(to right, rgb(${startSquareColor[0]}, ${startSquareColor[1]}, ${startSquareColor[2]}), ${theme.palette.primary.main})`,
                            marginRight: '4px',
                            borderRadius: '2px',
                        }}
                    />
                    <div
                        style={{
                            width: '14px',
                            height: '14px',
                            backgroundColor: `rgb(${endSquareColor[0]}, ${endSquareColor[1]}, ${endSquareColor[2]})`,
                            marginRight: '4px',
                            borderRadius: '2px',
                        }}
                    />
                    {/* <p>{maxClears > ABSOLUTE_RANGE_LIMIT ? `${ABSOLUTE_RANGE_LIMIT}+` : maxClears}</p> */}
                    <p><NumberFlow value={maxClears > ABSOLUTE_RANGE_LIMIT ? ABSOLUTE_RANGE_LIMIT : maxClears} suffix={maxClears > ABSOLUTE_RANGE_LIMIT ? '+' : ''} /></p>
                </div>
            </Box>
        </>
    )
}

export default ProfilePageDaily;