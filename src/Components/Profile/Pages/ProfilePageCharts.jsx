import { Box, Collapse, Grid, List, ListItemButton, ListItemText } from "@mui/material";
import ProfileChartAccuracyDifficulty from "./Charts/ProfileChartAccuracyDifficulty";
import ProfileChartPerformanceSpread from "./Charts/ProfileChartPerformanceSpread";
import ProfileChartScoreSpread from "./Charts/ProfileChartScoreSpread";
import { useState } from "react";
import ProfileChartPeriodic from "./Charts/ProfileChartPeriodic";

const CHART_PAGES = {
    ['accuracy-difficulty']: {
        name: "Accuracy vs Difficulty",
        component: ProfileChartAccuracyDifficulty,
    },
    ['performance-spread']: {
        name: "Performance Spread",
        component: ProfileChartPerformanceSpread,
    },
    ['score-spread']: {
        name: "Score Spread",
        component: ProfileChartScoreSpread,
    },
    ['periodic']: {
        name: "Periodic Charts",
        component: ProfileChartPeriodic,
    },
}

function ProfilePageCharts() {
    const [activeChartPage, setActiveChartPage] = useState('accuracy-difficulty');

    return (
        <Box sx={{ padding: 2 }}>
            <Grid container spacing={2}>
                {/* side bar */}
                <Grid size={{ xs: 12, sm: 12, md: 3, lg: 2 }}>
                    <List>
                        {Object.entries(CHART_PAGES).map(([key, chartPage]) => (
                            <ListItemButton
                                key={key}
                                selected={activeChartPage === key}
                                onClick={() => setActiveChartPage(key)}
                            >
                                <ListItemText primary={chartPage.name} />
                            </ListItemButton>
                        ))}
                    </List>
                </Grid>
                {/* chart area */}
                <Grid size={{ xs: 12, sm: 12, md: 9, lg: 10 }}>
                    {
                        Object.entries(CHART_PAGES).map(([key, chartPage]) => {
                            const ChartComponent = chartPage.component;
                            return (
                                <Collapse key={key} in={activeChartPage === key} unmountOnExit>
                                    <ChartComponent />
                                </Collapse>
                            )
                        })
                    }
                </Grid>
            </Grid>
            {/* <ProfileChartAccuracyDifficulty /> */}
        </Box>
    )
}

export default ProfilePageCharts;