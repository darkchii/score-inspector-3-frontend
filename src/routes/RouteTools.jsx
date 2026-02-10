import { Box, Collapse, Grid, List, ListItemButton, ListItemText, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { usePageTitle } from "../providers/TitleProvider";
import ToolAttributeCalculator from "../components/tools/ToolAttributeCalculator";

const TOOLS = [
    {
        name: 'Attribute Calculator',
        description: 'Calculates attributes based on mods',
        link: '/tools/attribute-calculator',
        component: <ToolAttributeCalculator />
    }
]

function RouteTools() {
    const { tool } = useParams();
    const navigate = useNavigate();
    const [toolData, setToolData] = useState(null);
    usePageTitle(`${toolData ? toolData.name : 'Tools'}`);

    const openTool = (tool) => {
        navigate(tool.link);
    }

    useEffect(() => {
        const foundTool = TOOLS.find(t => t.link === `/tools/${tool}`);
        setToolData(foundTool || null);
    }, [tool]);

    return (
        <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 2 }}>
                    <Paper>
                        <List>
                            {
                                TOOLS.map((tool) => (
                                    <ListItemButton key={tool.name} onClick={() => openTool(tool)}>
                                        <ListItemText primary={tool.name} secondary={tool.description} />
                                    </ListItemButton>
                                ))
                            }
                        </List>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 10 }}>
                    <Paper sx={{ p: 2 }}>
                        {
                            !tool ? (
                                <Collapse in={!tool}>
                                    <Typography variant="h5" align="center">Select a tool from the left</Typography>
                                </Collapse>
                            ) : (
                                <Collapse in={!!toolData}>
                                    {toolData ? toolData.component : (
                                        <Typography variant="h5" align="center">Tool not found</Typography>
                                    )}
                                </Collapse>
                            )
                        }
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    )
}

export default RouteTools;