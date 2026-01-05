import { Box, Button, ButtonGroup, Collapse, Divider, Grid, Typography, useTheme } from "@mui/material";
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
import InteractiveBox from "../../InteractiveBox";
import { ProfileRulesetScoreSet } from "../../../types/ProfileRulesetScoreSet";

//uses periodic_by_year from the ProfileRulesetStatistics type
function ProfilePageDaily() {
    const { getRulesetStatistics, activeRuleset } = useProfile();

    const [statDatabase, setStatDatabase] = useState(null);
    const [yearRange, setYearRange] = useState(5);
    const [activeDisplayYear, setActiveDisplayYear] = useState(new Date().getUTCFullYear());

    const [activeYearData, setActiveYearData] = useState(null);

    //this is what determines what statistics are actually shown
    const [activeDateStart, setActiveDateStart] = useState(null);
    const [activeDateEnd, setActiveDateEnd] = useState(null);
    const [activeScoreSet, setActiveScoreSet] = useState(null);

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
                    setActiveDateStart(dailyDates[0]);
                    setActiveDateEnd(null);
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

    useEffect(() => {
        let _scores_arr = [];
        if (activeDateStart && statDatabase?.periodic?.['daily']) {
            const dailyData = statDatabase?.periodic?.['daily'];
            const startDate = new Date(activeDateStart);
            const endDate = activeDateEnd ? new Date(activeDateEnd) : startDate;
            for (const dateKey in dailyData) {
                const currentDate = new Date(dateKey);
                if (currentDate >= startDate && currentDate <= endDate) {
                    //dailyData[dateKey] IS the array of scores, merge them into _scores_arr
                    _scores_arr = _scores_arr.concat(dailyData[dateKey] || []);
                }
            }
        }

        //merge them
        if (_scores_arr.length > 0) {
            const set = new ProfileRulesetScoreSet();
            _scores_arr.forEach(score => {
                set.addScore(score);
            });
            set.calculate();
            const mergedSet = set;
            setActiveScoreSet(mergedSet);
        } else {
            setActiveScoreSet(null);
        }
    }, [activeDateStart, activeDateEnd, activeRuleset]);

    if (!getRulesetStatistics(activeRuleset)) {
        return <div>No data available.</div>
    }

    const onDateSelected = (dateKey, isSecondary = false) => {
        console.log('date selected', dateKey, isSecondary);
        if (!isSecondary || (!activeDateStart && !activeDateEnd)) {
            setActiveDateStart(dateKey);
            setActiveDateEnd(null);
        } else {
            //if new dateKey is after activeDateStart, set as activeDateEnd
            const startDate = new Date(activeDateStart);
            const selectedDate = new Date(dateKey);
            //if same, do nothing
            if (selectedDate.getTime() === startDate.getTime()) {
                return;
            }
            if (selectedDate >= startDate) {
                setActiveDateEnd(dateKey);
            } else {
                let cacheStart = activeDateStart;
                setActiveDateStart(dateKey);
                setActiveDateEnd(cacheStart);
            }
        }
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
                <DateGrid
                    year={activeDisplayYear}
                    data={activeYearData}
                    activeDateStart={activeDateStart}
                    onDateSelected={onDateSelected}

                    activeDateEnd={activeDateEnd}
                    onDateSecondarySelected={(dateKey) => onDateSelected(dateKey, true)}
                />
            </div>
            <div>
                {
                    //if activeDate is set, and it exists in activeYearData, show details
                    activeDateStart && activeYearData && activeScoreSet ? (
                        <Collapse in={activeScoreSet != null} unmountOnExit>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}>
                                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                                    Viewing {activeDateStart} {activeDateEnd ? `- ${activeDateEnd}` : ''}
                                </Typography>
                                <ProfileDailyChart
                                    sessions={activeScoreSet.sessions}
                                    scores={activeScoreSet.scores}
                                    dateStart={activeDateStart}
                                    dateEnd={activeDateEnd}
                                />
                                <Divider sx={{ width: '100%', my: 2 }} />
                                <GradesDisplay grades={activeScoreSet.grades} />
                                <Divider sx={{ width: '100%', my: 2 }} />
                                <ScoreList
                                    scores={activeScoreSet.scores_reordered?.['date']} truncate={true}
                                />
                            </div>
                        </Collapse>
                    ) : (
                        <Collapse in={activeScoreSet == null} unmountOnExit>
                            <p>Select a date to see details.</p>
                        </Collapse>
                    )
                }
            </div>
        </div>
    )
}

const ABSOLUTE_RANGE_LIMIT = 100;
function DateGrid({ year, data, activeDateStart = null, activeDateEnd = null, onDateSelected = null, onDateSecondarySelected = null }) {
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
                if (data[dateString].length > _maxClears) {
                    _maxClears = data[dateString].length;
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
                                        const clears = dayData ? dayData.length : 0;
                                        const adjustedClears = Math.min(clears, ABSOLUTE_RANGE_LIMIT);

                                        //based on clears 0-maxClears/limit, interpolate from #1a1a1a to theme.palette.primary.main
                                        let progress = maxClears > ABSOLUTE_RANGE_LIMIT ? adjustedClears / ABSOLUTE_RANGE_LIMIT : (maxClears === 0 ? 0 : adjustedClears / maxClears);
                                        // let progress = Math.min(adjustedClears, 100) / 100;
                                        let color = `rgb(${Math.round(startSquareColor[0] + (endSquareColor[0] - startSquareColor[0]) * progress)}, ${Math.round(startSquareColor[1] + (endSquareColor[1] - startSquareColor[1]) * progress)}, ${Math.round(startSquareColor[2] + (endSquareColor[2] - startSquareColor[2]) * progress)})`;

                                        let isSelected = false;
                                        //if between activeDateStart and activeDateEnd, or equals either
                                        if (activeDateStart && !activeDateEnd && dateKey === activeDateStart) {
                                            isSelected = true;
                                        } else if (activeDateStart && activeDateEnd) {
                                            const startDate = new Date(activeDateStart);
                                            const endDate = new Date(activeDateEnd);
                                            const currentDate = new Date(dateKey);
                                            if (currentDate >= startDate && currentDate <= endDate) {
                                                isSelected = true;
                                            }
                                        }

                                        squares.push(
                                            <BetterTooltip key={dateKey} title={`${dateKey}: ${clears} clears`} placement='top' disableInteractive={true}>
                                                <InteractiveBox
                                                    style={{
                                                        '--target-color': color,
                                                        //if no clears, reset hover
                                                        '&:hover': { cursor: clears > 0 ? 'pointer' : 'default' }
                                                    }}
                                                    // className={`${dateGridStyles['date-grid__square']} ${clears > 0 ? dateGridStyles['date-grid__square--clickable'] : dateGridStyles['date-grid__square--empty']}`}
                                                    className={`${dateGridStyles['date-grid__square']} ${clears > 0 ? dateGridStyles['date-grid__square--clickable'] : dateGridStyles['date-grid__square--empty']} ${isSelected ? dateGridStyles['date-grid__square--active'] : ''}`}
                                                    //clickable if clears > 0
                                                    onClick={() => {
                                                        clears > 0 && onDateSelected && onDateSelected(dateKey);
                                                    }}
                                                    onLongPress={() => {
                                                        clears > 0 && onDateSecondarySelected && onDateSecondarySelected(dateKey);
                                                    }}
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